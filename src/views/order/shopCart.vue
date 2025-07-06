<script setup lang="ts">
  import CartAPI from "@/api/cart.api.ts";
  import { formatCurrency,needAuthLogin } from "@/utils";
  import { onMounted, onUnmounted } from 'vue';
  import { getAccessToken } from "@/utils/auth";
  import router from "@/router";
  import { useUserStore, useCommunityStore ,useCartStore} from "@/store";

  const loadOver = ref(false);
  const communityStore = useCommunityStore();
  const cartStore = useCartStore();
  const userStore = useUserStore();
  const addFlag = ref(1);
  const needAuth = ref(false);
  const isEmpty = ref(false);
  const community = ref({});

  const rickupTimeData = ref({
    list:[],
    currentDate:'',
    currentTimes:''
  })
  const data = reactive({
    community_id:'',
    tabIdx: 0,
    mult_carts:[],
    total_free:0,
    allselect:false,
    allcount: "0.00",
    canbuy_other:0,
    allnum:0,
    is_open_vipcard_buy:0,
    is_vip_card_member:0 ,
    carts : undefined ,
    showTab : false,
    isEmpty : true,
    is_comunity_rest : 0 ,
    open_man_orderbuy : 0 ,
    man_orderbuy_money :  0,
    is_show_guess_like : 0 ,
    man_free_tuanzshipping :  0 , // 需要金额
    delivery_tuanz_money : 0 , //配送费
    is_open_vipcard_buy : 0 ,
    is_vip_card_member :  0 ,
    vipcard_save_money :  0 ,
    modify_vipcard_name :  0 ,
    is_member_level_buy : 0 ,
    level_save_money : 0 ,
    tabList : [] ,
    open_tuan_ship : 0 ,
    full_list : [] ,
    is_open_fullreduction : 0 ,
    localtown_moneytype_fixed_deliverymoney : '' ,
    localtown_moneytype_fixed_freemoney : '',

    updateCart:0

  });

  onMounted(() =>{
    onLoad();
  });

  function onLoad() {
    try {
      loadOver.value = false

      const token = getAccessToken();
      console.log('step1');
      let communityInfo = communityStore.communityInfo;
      let community_id = communityInfo.communityId || '';
      let options = router.params || {}; // 获取动态参数

      communityStore.getCommunityById(options.community_id).then((res) => {
        console.log(res,'step2');
        if (res.code == 0) {

          if (res.open_danhead_model == 1) {
            console.log('开启单社区step7');
            community.value = res.default_head_info;
            data.community_id = res.default_head_info.communityId
            open_danhead_model.value = res.open_danhead_model;
            token && addhistory(res.default_head_info.communityId || '');
            communityStore.changeCommunity(res.default_head_info)
          }
          loadPage();
        }

      }).catch((error) => {
        loadPage();
      });


    } catch (error) {
      // 5. 统一错误处理
      ElMessage.warning(error);
      console.error("登录失败:", error);
    }
  }

  function loadPage() {
    userStore.check_login().then((res)=>{
      let communityInfo = communityStore.communityInfo;
      let community_id = communityInfo.communityId;
      needAuth.value =  false;
      isEmpty.value = false;
      data.community_id = community_id;
      getExpressDateList();
      showCartGoods();
    }).catch((error)=>{
      setTimeout(function(){  loadOver.value = true },1000);
      needAuthLogin();
      needAuth.value = true;
      isEmpty.value = true;
    })
  }
  

   function showCartGoods() {
    let token = getAccessToken();
    let community_id = data.community_id
     data.mult_carts =[];
    CartAPI.showCartGoods(token,community_id).then((res)=>{
      if(res.code == 0){
        let mult_carts = res.mult_carts || [];
        let carts = {};
        let tabIdx = data.tabIdx;
        let mulCartArr = Object.keys(mult_carts);
        let objLen = mulCartArr.length;
        let showTab = false;
        let tabList = [];
        if (objLen > 1){
          showTab = true;
          mulCartArr.forEach((item)=>{
            tabList[item].enabled = true;
          })
          carts = mult_carts[tabIdx] || {};
        } else if(objLen==1) {
          tabIdx = mulCartArr[0];
          carts = mult_carts[tabIdx] || {};
        }

        let isEmpty = true;
        if (Object.keys(carts).length != 0) {
          isEmpty = false;
          carts = sortCarts(carts);
        }

        let {
          man_free_tuanzshipping,
          delivery_tuanz_money,
          is_comunity_rest,
          open_man_orderbuy,
          man_orderbuy_money,
          is_show_guess_like,
          is_open_vipcard_buy,
          is_vip_card_member,
          vipcard_save_money,
          modify_vipcard_name,
          is_member_level_buy,
          level_save_money,
          open_tuan_ship,
          full_list,
          is_open_fullreduction,
          localtown_moneytype_fixed_deliverymoney,
          localtown_moneytype_fixed_freemoney
        } = res;
        data.tabIdx = tabIdx;
        data.carts = carts;
        data.showTab = showTab;
        data.isEmpty = isEmpty;
        data.is_comunity_rest = is_comunity_rest;
        data.open_man_orderbuy = open_man_orderbuy;
        data.man_orderbuy_money =  man_orderbuy_money * 1,
        data.is_show_guess_like = is_show_guess_like;
        data.man_free_tuanzshipping =  man_free_tuanzshipping; // 需要金额
        data.delivery_tuanz_money = delivery_tuanz_money; //配送费
        data.is_open_vipcard_buy = is_open_vipcard_buy;
        data.is_vip_card_member = is_vip_card_member;
        data.vipcard_save_money = vipcard_save_money;
        data.modify_vipcard_name = modify_vipcard_name;
        data.is_member_level_buy = is_member_level_buy;
        data.level_save_money = level_save_money;
        data.tabList= tabList;
        data.open_tuan_ship= open_tuan_ship;
        data.full_list = full_list;
        data.is_open_fullreduction = is_open_fullreduction;
        data.localtown_moneytype_fixed_deliverymoney = localtown_moneytype_fixed_deliverymoney;
        data.localtown_moneytype_fixed_freemoney = localtown_moneytype_fixed_freemoney;


        let total_free = 0;
        res.mult_carts.forEach(carts => {
          carts.forEach(item => {
            console.log(item)
            data.mult_carts.push({
              ...item,
              // 确保子集合也被 reactive 处理
              shopcarts: reactive(item.shopcarts || [])
            });
          });
        });
        xuan_func();
      }

    }).finally(setTimeout(function(){  loadOver.value = true },1000))

  }

  /**
   * 商品排序
   */
  function sortCarts(carts) {
    // 先剔除失效（保留原有结构）=>再分出满减
    let is_open_fullreduction = 0;
    let full_reducemoney = 0;
    let full_money = 0;
    let invalidCarts = {};
    let hasInvalid = 0;

    for (let i in carts) {
      is_open_fullreduction = carts[i].is_open_fullreduction;
      full_reducemoney = carts[i].full_reducemoney;
      full_money = carts[i].full_money;
      invalidCarts[i] = {
        id: carts[i].id,
        shopcarts: []
      };

      let shopcarts = carts[i].shopcarts;
      let oriShopcarts = [];
      shopcarts.forEach(function(item, index) {
        if(item.can_buy==0 || item.option_can_buy==0) {
          invalidCarts[i].shopcarts.push(item);
          hasInvalid += 1;
        } else {
          oriShopcarts.push(item);
        }
      })
      carts[i].shopcarts = oriShopcarts;
      oriShopcarts.sort(function(x, y) {
        if (x.can_man_jian < y.can_man_jian) {
          return 1;
        }
        if (x.can_man_jian > y.can_man_jian) {
          return -1;
        }
        return 0;
      });
    }
    data.is_open_fullreduction = is_open_fullreduction;
    data.full_reducemoney = full_reducemoney;
    data.full_money = full_money;
    data.invalidCarts = invalidCarts;
    data.hasInvalid = hasInvalid;
    return carts;
  }
  function xuan_func() {
    let allnum = 0;
    let allcount = 0

    let flag = 1;
    let allselect = false;
    let all_cant_buy = 1;
    for (let i in data.carts) {
      let count = 0;
      data.carts[i].goodstypeselect = 0;
      data.carts[i].goodstype = data.carts[i].shopcarts.length;

      for (let j = 0; j < data.carts[i].shopcarts.length; j++) {
        let shopcartsItem = data.carts[i].shopcarts[j];
        if (shopcartsItem.isselect == false && shopcartsItem.can_buy == 1 && shopcartsItem.can_buy == 1 && shopcartsItem.option_can_buy == 1) flag = 0;
        if (shopcartsItem.isselect && shopcartsItem.can_buy == 1 && shopcartsItem.can_buy == 1 && shopcartsItem.option_can_buy == 1) {
          all_cant_buy = 0;
          //20190927
          count = calcVipPrice(count, shopcartsItem);
          data.carts[i].goodstypeselect++;
          allnum = parseInt(allnum) + parseInt(shopcartsItem.goodsnum);
        }

        if (shopcartsItem.can_buy == 0) shopcartsItem.isselect = false;
      }
      data.carts[i].count = count.toFixed(2);
      allcount = allcount + count;
    }
    if (flag == 1 && all_cant_buy == 0) { //是全部选中
      allselect = true;
    }
    data.allselect =  allselect;
    data.allnum =  allnum;
    data.allcount =  allcount.toFixed(2);
    console.log(data.allcount)
    calcAmount();
  }

  function calcVipPrice(count, good, num=0, type="add") {
    let { is_open_vipcard_buy, is_vip_card_member, canLevelBuy } = data;
    let goodsNum = num > 0 ? num : parseFloat(good.goodsnum);
    if (type === 'red') goodsNum = -1*goodsNum;
    count = parseFloat(count);
    // if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && good.is_take_vipcard==1 ) {
    //   return count += parseFloat(good.card_price) * goodsNum;
    // } else if (canLevelBuy && good.is_mb_level_buy == 1){
    //   return count += parseFloat(good.levelprice) * goodsNum;
    // }else {
    return count += parseFloat(good.currntprice) * goodsNum;
    // }
  }

  function calcAmount() {
    let {
      is_open_vipcard_buy,
      is_vip_card_member,
      carts,
      delivery_tuanz_money,
      man_free_tuanzshipping,
      full_list,
      allcount,
      tabIdx
    } = data;
    let totalAmount = 0; //合计
    let disAmount = 0; //优惠
    let diffMoney = 0; //差多少可满减
    let cartsArr = Object.keys(carts);
    let allReducGoods = []; //所有满减商品
    let full_money = 0;
    let full_reducemoney = 0;
    let isCanManJian = 0;

    // 免配送费
    let deliveryGoodsTot = 0;
    let selectGoodsTot = 0; //商品价格合计

    // 开通vip优惠提示
    let vipFee = 0;
    let levelFee = 0;
    let localtown_fee_list = tabIdx==3?{}:''; //同城配送起送优惠信息

    cartsArr.forEach(key => {
      let cart = carts[key];
      let shopcarts = cart.shopcarts;
      full_money = cart.full_money * 1;
      full_reducemoney = cart.full_reducemoney * 1;
      let localtown_fixed_list = cart.localtown_fixed_list || '';
      let curSelectGoodsTot = 0; //当前平台选中商品合计
      // 1选提取所有的满减商品
      shopcarts.forEach(function(item) {
        if (item.isselect && item.can_man_jian) {
          allReducGoods.push(item);
        }
        if (item.isselect && man_free_tuanzshipping > 0 && delivery_tuanz_money > 0) {
          if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1) {
            accordTot += item.card_price * item.goodsnum * 1;
          } else if (item.is_mb_level_buy == 1){
            accordTot += item.levelprice * item.goodsnum * 1;
          } else {
            accordTot += item.currntprice * item.goodsnum * 1;
          }
        }

        //vip优惠
        if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1 && item.isselect) {
          vipFee += (item.currntprice - item.card_price) * item.goodsnum * 1;
        } else if (item.is_mb_level_buy == 1 && item.isselect) {
          //等级优惠
          levelFee += (item.currntprice - item.levelprice) * item.goodsnum * 1;
        }

        //自营商品满减配送费商品合计
        if (item.isselect && item.store_id==0) {
          if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard == 1) {
            deliveryGoodsTot += item.card_price * item.goodsnum * 1;
          } else if (item.is_mb_level_buy == 1){
            deliveryGoodsTot += item.levelprice * item.goodsnum * 1;
          } else {
            deliveryGoodsTot += item.currntprice * item.goodsnum * 1;
          }
        }

        // 商品合计
        if (item.isselect) {
          selectGoodsTot += item.currntprice * item.goodsnum * 1;
        }

        //同城配送
        if (item.isselect && tabIdx==3) {
          curSelectGoodsTot += item.currntprice * item.goodsnum * 1;
        }
      })
      if(tabIdx==3){
        let { localtown_moneytype_fixed_deliverymoney, localtown_moneytype_fixed_freemoney } = localtown_fixed_list;
        let localtownCanBuy = localtown_moneytype_fixed_deliverymoney*1 - curSelectGoodsTot; //>0显示起送差额
        let localtownManJian = localtown_moneytype_fixed_freemoney*1 - curSelectGoodsTot; //>0显示免配送差额
        localtown_fee_list[key] = {};
        localtown_fee_list[key].localtownCanBuy = localtownCanBuy;
        localtown_fee_list[key].localtownManJian = localtownManJian;
        localtown_fee_list[key].localtown_moneytype_fixed_deliverymoney = localtown_moneytype_fixed_deliverymoney;
        localtown_fee_list[key].localtown_moneytype_fixed_freemoney = localtown_moneytype_fixed_freemoney;
      }
    })

    // 计算满减金额
    let accordTot = 0;
    allReducGoods.forEach(function(item) {
      if (item.isselect && item.can_man_jian) {
        if (is_open_vipcard_buy == 1 && is_vip_card_member == 1 && item.is_take_vipcard==1) {
          accordTot += item.card_price * item.goodsnum * 1;
        } else if (item.is_mb_level_buy == 1){
          accordTot += item.levelprice * item.goodsnum * 1;
        } else {
          accordTot += item.currntprice * item.goodsnum * 1;
        }
        isCanManJian = 1;
      }
    })

    let currentMjIdx = -1; //当前满减索引
    full_list.forEach((item, index)=>{
      if(accordTot >= item.full_money) {
        full_money = item.full_money*1;
        full_reducemoney = item.full_reducemoney*1;
        full_list[index].disable = true;
        currentMjIdx = index;
      } else {
        full_list[index].disable = false;
      }
    })
    // 未满足
    let cur_full_item = null;
    // 已享
    let sucess_full_item = null;
    let tot_full_len = full_list.length || 0;
    if(currentMjIdx==-1){
      cur_full_item = full_list[0];
    } else {
      if(currentMjIdx<tot_full_len) {
        if(currentMjIdx+1!=tot_full_len) cur_full_item = full_list[currentMjIdx+1];
        sucess_full_item = full_list[currentMjIdx];
      } else {
        sucess_full_item = full_list[currentMjIdx];
      }
    }

    if (accordTot >= full_money) {
      disAmount += full_reducemoney;
    } else {
      diffMoney = full_money - accordTot;
    }

    let nextDiffMoney = 0;
    if(full_list.length > currentMjIdx+1) {
      nextDiffMoney = full_list[currentMjIdx+1].full_money*1 - accordTot;
    }

    // 优惠金额（包含满减，会员等级优惠）
    disAmount += vipFee + levelFee;

    totalAmount = (allcount * 1 - disAmount).toFixed(2);
    totalAmount = totalAmount <= 0 ? 0 : totalAmount;

    let canbuy_tot = allcount * 1; //合计 计算满多少下单使用
    let canbuy_other = canbuy_tot - data.man_orderbuy_money;
    let vipTotal = selectGoodsTot;
    let levelToTal = selectGoodsTot;

    // 团长满配送费
    let diffDeliveryMoney = 0;
    if (deliveryGoodsTot < man_free_tuanzshipping*1) {
      diffDeliveryMoney = man_free_tuanzshipping*1 - deliveryGoodsTot;
    }

    // 同城配送
    let localtownCanBuy = true; //是否可以结算
    if(tabIdx==3) {
      Object.keys(localtown_fee_list).forEach(idx=>{
        if(localtown_fee_list[idx].localtownCanBuy>0&&carts[idx].isselect) localtownCanBuy = false;
      })
    }

    console.log('=====carts=====', Object.keys(carts))
    data.isCanManJian = isCanManJian;
      data.canbuy_tot = canbuy_tot;
      data.totalAmount = totalAmount;
      data.disAmount =  disAmount.toFixed(2) ;
      data.diffMoney =  diffMoney.toFixed(2) ;
      data.canbuy_other =  canbuy_other.toFixed(2);
      data.diffDeliveryMoney =  diffDeliveryMoney.toFixed(2);
      data.vipFee =  vipFee.toFixed(2);
      data.vipTotal = vipTotal.toFixed(2);
      data.levelFee = levelFee.toFixed(2);
      data.levelToTal = levelToTal.toFixed(2);
      data.full_reducemoney = full_reducemoney;
      data.full_list = full_list;
      data.nextDiffMoney =  nextDiffMoney.toFixed(2);
      data.cur_full_item= cur_full_item;
      data.sucess_full_item = sucess_full_item;
      data.localtown_fee_list = localtown_fee_list;
      data.localtownCanBuy = localtownCanBuy
    console.log('=====carts=====', data)
  }
  function getExpressDateList() {
    const token = getAccessToken();
    let community_id = data.community_id
    CartAPI.getExpressDateList(community_id).then((res)=>{
      console.log("getExpressDateList",res)
      if(res.code == 0){
        rickupTimeData.value.list = res.data;
      }
    })
  }

  function handleDateChange(value){
    console.log(value)
  }
  function validateCheckout() {
    if(!rickupTimeData.value.currentDate){
      ElMessage.warning('Choose a date and time.');
      return
    }

    if(!rickupTimeData.value.currentTimes){
      ElMessage.warning('Select a time.');
      return;
    }
    router.push({ path: '/ulink_comshop/pages/order/placeOrder', state: { delivery_date: rickupTimeData.value.currentDate,delivery_time: rickupTimeData.value.currentTimes } })
  }

  function handleRemoveGoods(event) {

    const key = event.target.dataset.key;
    ElMessageBox.confirm(
      'Are you sure you want to delete the item?',
      'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
      .then(() => {
          del_car_goods(key)

      })

  }

  function del_car_goods(key) {
    const token = getAccessToken();
    let community_id = data.community_id
    CartAPI.del_car_goods(token,community_id,key).then((res)=>{
      cartStore.getCartNum(community_id)
      showCartGoods();
    })
  }

  function changeNumber(e) {

    if (Object.keys(data.carts).length<=0) return;
    let parentid = parseInt(e.currentTarget.dataset.parentid);
    let index = parseInt(e.currentTarget.dataset.index);
    let iptVal = e.target.value;
    let newCount = count_goods(parentid, index);
    let goodsItem = data.carts[parentid].shopcarts[index];
    let lastGoodsnum = goodsItem.goodsnum;
    console.log(iptVal);
    if (iptVal > 0) {
      var max_quantity = parseInt(goodsItem.max_quantity);
      if (iptVal > max_quantity) {
        iptVal = max_quantity;
        ElMessage('不能购买更多啦')
      }
      goodsItem.goodsnum = iptVal;
      if (data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
        newCount = count_goods(parentid, index);
      }

      data.allnum =  newCount.allnum;
      data.allcount =  newCount.allcount;

      let token = getAccessToken()
      let keys_arr = [];
      let all_keys_arr = [];
      let allnum = data.allnum;
      let carts = data.carts;

      for (var i in carts) {
        for (var j in carts[i]['shopcarts']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }

      let cur_car_key = goodsItem.key || '';
      let community_id = data.community_id

      CartAPI.checkout_flushall(token,community_id,keys_arr.join(','),all_keys_arr.join(','),cur_car_key).then((res)=>{

        if (res.code == 0) {
          cartStore.getCartNum(community_id)
          if (data.carts[parentid].shopcarts[index].goodstype == '') {
            let goodsnum = data.carts[parentid].shopcarts[index].goodsnum * 1;
            let gid = data.carts[parentid].shopcarts[index].id;
            data.dupdateCart =  data.dupdateCart + 1
          }
          go_record();
        }else{
          data.carts[parentid].shopcarts[index].goodsnum = lastGoodsnum;
          if (data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
            newCount = count_goods(parentid, index);
          }
          data.allnum = newCount.allnum;
          data.allcount =  newCount.allcount;
          console.log(res.msg);
          ElMessage(res.msg)
        }
      })
    }else{
      data.carts[parentid].shopcarts[index].goodsnum = 1;
      if (data.carts[parentid].shopcarts[index].isselect == true) { //商品为选中状态
        newCount = count_goods(parentid, index);
      }
      data.carts =  data.carts;
      data.allnum =  newCount.allnum;
      data.allcount = newCount.allcount;
      let token =getAccessToken()
      let keys_arr = [];
      let all_keys_arr = [];
      let allnum = data.allnum;
      let carts = data.carts;
      let community_id = data.community_id


      for (var i in carts) {
        for (var j in carts[i]['shopcarts']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }

      let cur_car_key = goodsItem.key || '';
      CartAPI.checkout_flushall(token,community_id,keys_arr.join(','),all_keys_arr.join(','),cur_car_key).then((res)=>{
        if (res.code == 0) {
          cartStore.getCartNum(community_id)
          if (that.data.carts[parentid].shopcarts[index].goodstype == '') {
            let goodsnum = that.data.carts[parentid].shopcarts[index].goodsnum * 1;
            let gid = that.data.carts[parentid].shopcarts[index].id;
            data.updateCart = data.updateCart+1
          }
          go_record();
        }
      })
      cofirm_del(parentid, index);
    }

  }

  function count_goods(parentid, index) {

    let carts = data.carts;
    // let cart = carts[parentid];
    let allnum = 0;
    let allcount = 0;
    for (let carsKey of Object.keys(carts)) {
      let cart = carts[carsKey];
      cart.shopcarts.forEach(function (item, idx) {
        if (item.isselect) {
          allcount = calcVipPrice(allcount, item);
          allnum += parseInt(item.goodsnum);
        }
      })
    }

    return {
      allnum,
      allcount: allcount.toFixed(2)
    }
  }

  function regoodsnum(e) {
    let parentid = parseInt(e.currentTarget.dataset.parentid);
    let index = parseInt(e.currentTarget.dataset.index);
    let updateCart = data.updateCart;
    let goodsItem = data.carts[parentid].shopcarts[index];

    console.log(goodsItem)
    // 起购数量
    let goods_start_count = goodsItem.goods_start_count || 1;

    let goodsnum = goodsItem.goodsnum;
    if (goodsnum == 1 || goodsnum<=goods_start_count) { //减少前商品数量为1
      cofirm_del(parentid, index);
    } else { //减少前商品的数量不为1
      if (goodsItem.isselect == true) { //商品为选中状态
        let allnum = parseInt(data.allnum) - 1;
        //20190927
        let allcount = calcVipPrice(data.allcount, goodsItem, 1, 'red');
        let count = calcVipPrice(data.carts[parentid].count, goodsItem, 1, 'red');

        data.carts[parentid].count = count.toFixed(2);
        goodsItem.goodsnum = goodsItem.goodsnum - 1;
        data.allnum = allnum;
        data.allcount =  allcount.toFixed(2)

      } else { //商品为非选中状态
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) - 1;
        dara.carts =  dara.carts
      }
    }
    if (goodsItem.goodstype == '') {
      let goodsnum = goodsItem.goodsnum * 1;
      let gid = e.currentTarget.dataset.gid;
      data.updateCart =  data.dupdateCart + 1
    }
    let cur_car_key = goodsItem.key || '';
    go_record(cur_car_key);
  }


  function addgoodsnum(e) {
    console.log(e.currentTarget.dataset)
    if (addFlag.value == 0) return;
    addFlag.value = 0;
    let parentid = parseInt(e.currentTarget.dataset.parentid);
    let index = parseInt(e.currentTarget.dataset.index);

    let goodsItem = data.carts[parentid].shopcarts[index];
    let max_quantity = parseInt(goodsItem.max_quantity);
    if (goodsItem.isselect == true) { //商品为选中状态
      let allnum = parseInt(data.allnum) + 1;
      // 20190927
      let allcount = calcVipPrice(data.allcount, goodsItem, 1);
      let count = calcVipPrice(data.carts[parentid].count, goodsItem, 1);
      data.carts[parentid].count = count.toFixed(2);

      if (goodsItem.goodsnum < max_quantity) {
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) + 1;
      } else {
        addFlag.value = 1;
        goodsItem.goodsnum = max_quantity;
        allnum--;
        let msg = '最多购买' + max_quantity + '个';
        ElMessage(msg)
        return false;
      }
      data.allnum =  allnum;
      data.allcount =  allcount.toFixed(2)
    } else { //商品为非选中状态
      if (parseInt(goodsItem.goodsnum) < max_quantity) {
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) + 1;
      } else {
        addFlag.value = 1;
        var msg = '最多购买' + max_quantity + '个';
        ElMessage(msg)
        return false;
      }
    }

    let token = getAccessToken()
    let keys_arr = [];
    let all_keys_arr = [];
    let allnum = data.allnum;
    let carts = data.carts;

    for (var i in carts) {
      for (var j in carts[i]['shopcarts']) {
        keys_arr.push(carts[i]['shopcarts'][j]['key']);
        all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
      }
    }
    let community_id = data.community_id
    let updateCart = data.updateCart || 0;
    let cur_car_key = goodsItem.key || '';
    CartAPI.checkout_flushall(token,community_id,keys_arr.join(','),all_keys_arr.join(','),cur_car_key).then((res)=>{
      if (res.code == 0) {
        cartStore.getCartNum(community_id)
      }else{
        goodsItem.goodsnum = parseInt(goodsItem.goodsnum) - 1;
        if (goodsItem.isselect == true) {
          // 20190927
          let allcount_new = calcVipPrice(data.allcount, goodsItem, 1, 'red');
          let count_new = calcVipPrice(data.carts[parentid].count, goodsItem, 1, 'red');
          data.carts[parentid].count = count_new.toFixed(2);
          allnum--;

          data.allnum =  allnum;
          data.allcount = allcount_new.toFixed(2)
        }
        ElMessage(res.msg)
      }
      addFlag.value = 1;
      go_record();
    }).catch((error)=>{
      addFlag.value = 1;
    })

  }

  function cofirm_del(parentid, index, type = 1) {
    let updateCart = data.updateCart;
    let goodsItem = data.carts[parentid].shopcarts[index];
    // 起购数量
    let goods_start_count = goodsItem.goods_start_count || 1;
    let content = '';
    if(goods_start_count>1) content =`该商品的起购数是${goods_start_count},`;

    ElMessageBox.confirm(
      content + ' Are you sure you want to delete the item?',
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
      .then(() => {
        if (goodsItem.goodstype == '') {
          let gid = goodsItem.id;
          data.updateCart =  updateCart + 1
        }

        let del_car_keys = goodsItem.key;
        // 起购数量
        let goodsnum = goodsItem.goodsnum;
        let reduceNum = goods_start_count;
        if(goodsnum<goods_start_count) {
          reduceNum = goodsnum;
        }

        if (goodsItem.isselect == true) { //商品为选中状态
          var allnum = data.allnum - reduceNum;

          // 20190927
          var allcount = calcVipPrice(data.allcount, goodsItem, reduceNum, 'red');
          var count = calcVipPrice(data.carts[parentid].count, goodsItem, reduceNum, 'red');

          data.carts[parentid].count = count.toFixed(2);
          data.carts[parentid].goodstype = data.carts[parentid].goodstype - 1;
          data.carts[parentid].goodstypeselect = data.carts[parentid].goodstypeselect - 1
          if (data.carts[parentid].goodstype == 0) { //购物车商店商品类别为0，去掉这个商店
            let carts = data.carts;
            delete carts[parentid];
            if (Object.keys(carts).length == 0) setData({
              isEmpty: true
            })
          } else { //不为0，去掉这个商品
            data.carts[parentid].shopcarts.splice(index, 1);
            //判断全选状态，有失效商品20190212
            isAllSelect();
          }
          data.allnum =  allnum;
          data.allcount = allcount.toFixed(2)

        } else { //商品为非选中状态
          data.carts[parentid].goodstype = data.carts[parentid].goodstype - 1;
          if (data.carts[parentid].goodstype == 0) {
            let carts = data.carts;
            delete carts[parentid];
            if (Object.keys(carts).length == 0) setData({
              isEmpty: true
            })
          } else {
            data.carts[parentid].shopcarts.splice(index, 1);
          }

        }
        del_car_goods(del_car_keys);
        calcAmount();

      })

  }


  /**
   * 删除选中商品，存在失效商品全选状态判断
   */
  function isAllSelect() {
    let flag = 1, allselect = false, carts = data.carts, isCanBuy = 0;
    for (let i in carts) {
      for (let j = 0; j < carts[i].shopcarts.length; j++) {
        if (carts[i].shopcarts[j].can_buy == 1 && carts[i].shopcarts[j].option_can_buy == 1) isCanBuy = 1;
        if (carts[i].shopcarts[j].isselect == false && carts[i].shopcarts[j].can_buy == 1 && carts[i].shopcarts[j].option_can_buy == 1) flag = 0;
      }
    }
    // console.log(flag);
    if (flag == 1 && isCanBuy == 1) allselect = true;

    data.allselect =  allselect
  }

  //记录购物车状态值，为了下次进来还是和上次一样
  function go_record(cur_car_key='') {

    let  token = getAccessToken()
    let keys_arr = [];
    let all_keys_arr = [];
    let allnum = data.allnum;
    let carts = data.carts;
    let community_id = data.community_id
    for (let i in carts) {
      for (let j in carts[i]['shopcarts']) {
        if (carts[i]['shopcarts'][j]['isselect']) {
          keys_arr.push(carts[i]['shopcarts'][j]['key']);
        }
        all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
      }
    }



    CartAPI.checkout_flushall(token,community_id,keys_arr.join(','),all_keys_arr.join(','),cur_car_key).then((res)=>{
      cartStore.getCartNum(community_id)
      calcAmount();
      if (res.code == 0) {
        data.cartNum = res.data
      } else {
        ElMessage(res.msg)
      }
    })



  }
  
  function goodsselect(e) {
    let parentid = parseInt(e.currentTarget.dataset.parentid);
    let index = parseInt(e.currentTarget.dataset.index);
    let allselect = data.allselect;
    let goodsItem = data.carts[parentid].shopcarts[index];
    let isselect = goodsItem.isselect;
    if (isselect == true) { //商品选中状态
      goodsItem.isselect = false;
      if (allselect)
        allselect = false;

      data.carts[parentid].goodstypeselect = parseInt(data.carts[parentid].goodstypeselect) - 1;
      if (data.carts[parentid].goodstypeselect <= 0) { //选中商品为0
        data.carts[parentid].isselect = false;
      }
      let allnum = parseInt(data.allnum) - parseInt(goodsItem.goodsnum);
      // 20190927
      let allcount = calcVipPrice(data.allcount, goodsItem, '', 'red');
      let count = calcVipPrice(data.carts[parentid].count, goodsItem, '', 'red');

      data.carts[parentid].count = count.toFixed(2);

      data.allnum =  allnum;
      data.allcount = allcount.toFixed(2);
      data.allselect =  allselect
    } else { //商品为非选中状态
      goodsItem.isselect = true;
      data.carts[parentid].goodstypeselect = parseInt(data.carts[parentid].goodstypeselect) + 1;

      if (data.carts[parentid].goodstypeselect > 0) { //选中商品个数大于0
        data.carts[parentid].isselect = true;
      }
      var flag = 1;
      for (var i in data.carts) {
        console.log('in');
        for (var j = 0; j < data.carts[i].shopcarts.length; j++)
          if (data.carts[i].shopcarts[j].isselect == false && data.carts[i].shopcarts[j].can_buy == 1 && data.carts[i].shopcarts[j].option_can_buy == 1) flag = 0;
      }

      if (flag == 1) { //全部商品选中
        allselect = true;
      }
      let allnum = parseInt(data.allnum) + parseInt(goodsItem.goodsnum);
      // 20190927
      let allcount = calcVipPrice(data.allcount, goodsItem);
      let count = calcVipPrice(data.carts[parentid].count, goodsItem);
      data.carts[parentid].count = count.toFixed(2);
      data.allnum =  allnum;
      data.allcount = allcount.toFixed(2);
      data.allselect =  allselect
    }
    go_record();
  }

  function handleAllselect() {
    let allselect = data.allselect;

    let carts = data.carts;

    if (allselect) { //点击前为全部选中状态
      allselect = false;
      let allnum = 0;
      let allcount = 0.00;
      for (let i in data.carts) {
        data.carts[i].count = "0.00";
        data.carts[i].isselect = false;
        data.carts[i].goodstypeselect = 0;
        for (let j in data.carts[i].shopcarts)
          data.carts[i].shopcarts[j].isselect = false;
      }

      data.allnum =  allnum;
      data.allcount = allcount.toFixed(2);
      data.allselect =  allselect
    } else { //点击前为不全部选址状态
      allselect = true;
      let allnum = 0;
      let allcount = 0.00;

      for (let i in data.carts) {
        let count = 0;
        data.carts[i].isselect = true;
        let shopcarts = data.carts[i].shopcarts;
        data.carts[i].goodstypeselect = shopcarts.length;
        for (let j in shopcarts) {
          if (shopcarts[j].can_buy == 1 && shopcarts[j].option_can_buy == 1) {
            //20190927
            count = calcVipPrice(count, shopcarts[j]);
            allnum = parseInt(allnum) + parseInt(data.carts[i].shopcarts[j].goodsnum);
            shopcarts[j].isselect = true;
          }

        }
        data.carts[i].count = count.toFixed(2);
        allcount = allcount + count;
      }
      data.carts = data.carts
      data.allnum =  allnum;
      data.allcount = allcount.toFixed(2);
      data.allselect =  allselect

    }
    go_record();
  }
  
  function toorder() {
    let token = getAccessToken()
    let keys_arr = [];
    let all_keys_arr = [];
    let allnum = data.allnum;
    if (allnum > 0) {
      let carts = data.carts;
      for (let i in carts) {
        for (let j in carts[i]['shopcarts']) {
          if (carts[i]['shopcarts'][j]['isselect']) {
            keys_arr.push(carts[i]['shopcarts'][j]['key']);
          }

          all_keys_arr.push(carts[i]['shopcarts'][j]['key'] + '_' + carts[i]['shopcarts'][j]['goodsnum']);
        }
      }
      let community_id = data.community_id;
      CartAPI.checkout_flushall(token,community_id,keys_arr.join(','),all_keys_arr.join(','),'').then((res)=>{
        if (res.code == 0) {
          let is_limit = res.data || 0;
          router.push({
            path: '/ulink_comshop/pages/order/placeOrder?type=dan&is_limit=' + is_limit
          })
        } else {
          ElMessage({
            message: res.msg,
            type: 'warning',
          })
          console.log(msg.data.msg);
        }
      })

    } else {
      ElMessage({
        message: 'Warning, this is a warning message.',
        type: 'warning',
      })
    }
  }
</script>

<template>
  <div class="main-content page-main--wrapper"  v-loading.fullscreen.lock="!loadOver" v-if="!needAuth">
    <div  class="shopify-section"><!-- /templates/cart.liquid -->
      <div class="wrapper-padded main-page-container">
        <div class="GWP-wrapper">

          <div class="gwp-content text-center">
            <p></p>
          </div>
          <div id="GWP-wraper" class="grid-uniform text-center initFrequently flickity-enabled jsc-flickity-initiated" tabindex="0">
            <div class="flickity-viewport" style="height: 0px; touch-action: pan-y;">
              <div class="flickity-slider" style="left: 0px;"></div>
            </div>
            <button class="flickity-button flickity-prev-next-button previous" type="button" disabled="" aria-label="Previous">
              <svg class="flickity-button-icon" viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow"></path></svg>
            </button>
            <button class="flickity-button flickity-prev-next-button next" type="button" disabled="" aria-label="Next"><svg class="flickity-button-icon" viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow" transform="translate(100, 100) rotate(180) "></path></svg>
            </button>
          </div>
        </div>

        <div class="sitewide--title-wrapper">
          <h1 class="page--title">Shopping cart</h1>
        </div>

        <div  class="cart table-wrap"  >
          <table class="cart-table full table--responsive">
            <thead class="cart__row cart__header-labels">
            <tr>
              <th scope="row" style="max-width: 20px" >
                <el-checkbox :checked="true" v-if="data.allselect" @click="handleAllselect"  />
                <el-checkbox :checked="false"  v-else @click="handleAllselect"  />
              </th>
              <th scope="row" colspan="2" class="text-center"></th>
              <th scope="row" class="text-center">Price</th>
              <th scope="row" class="text-center">Quantity</th>
              <th scope="row" class="text-center">Total</th>
            </tr>
            </thead>
            <tbody v-for="(item ,index) in data.carts">


            <tr class="cart__row table__section" v-for="(em ,idx) in item.shopcarts">
              <td style="max-width: 20px">
                <el-checkbox :checked="true"  v-if="em.isselect"  @click="goodsselect"  :data-parentid="index" :data-index="idx" :data-id="em.id" :data-value="em.isselect" />
                <el-checkbox :checked="false"  v-else @click="goodsselect"  :data-parentid="index" :data-index="idx" :data-id="em.id" :data-value="em.isselect" />
              </td>
              <td data-label="Product">
                <div class="cart__image">
                  <div class="responsive-image-wrapper" style="">
                    <el-image lazy style="width: 12vw; height: 12.5vw;min-width: 110px;min-height:100px " :src="em.imgurl" fit="cover" />
                  </div>
                </div>
              </td>
              <td class="cart__row--product-details">
                <router-link :to="'/ulink_comshop/pages/goods/goodsDetail?id='+em.id" style="font-size: 16px;">
                  {{ em.title_en }}
                </router-link>
                <div class="cart__meta-text">
                  <span id="ProductPrice" class="hide" >
                    ${{em.currntprice}}
                  </span>
                  <div style="display:none;">
                    Earn <span ></span> points
                  </div>
                </div>
                <a @click="handleRemoveGoods" class="cart__remove" :data-key="em.key" :data-name="em.title_en" style="font-size: 13.5px">
                  Remove
                </a>
              </td>
              <td class="text-center" data-label="Price">
                      <span class="cart-sale-price--with-discount">
                        <span class="money">$ {{ formatCurrency(em.currntprice)}}</span>
                      </span>
              </td>
              <td class="text-center" data-label="Quantity">
                <div class="js-qty-wrapper">
                  <div class="js-qty">
                    <button type="button" :data-index="idx" :data-parentid="index" :data-gid="em.id"  @click="regoodsnum" class="js js-qty__adjust js-qty__adjust--minus icon-fallback-text" >
                      <i class="fa fa-minus" aria-hidden="true"></i>
                      <span class="fallback-text" >−</span>
                    </button>
                    <input type="text" @change="changeNumber" :data-index="idx" :data-parentid="index" :data-gid="em.id" class="js-qty__num" :value="em.goodsnum" >
                    <button type="button" :data-index="idx" :data-parentid="index" :data-gid="em.id" @click.stop="addgoodsnum" class="jsc-asdsad js js-qty__adjust js-qty__adjust--plus icon-fallback-text" >
                      <i class="fa fa-plus" aria-hidden="true"></i>
                      <span class="fallback-text" >+</span>
                    </button>
                  </div>
                </div>
              </td>
              <td class="text-center cart-total-label" data-label="Total">
                <span class="money">$ {{ formatCurrency( em.currntprice * em.goodsnum)}}</span></td>
            </tr>

            </tbody>
          </table>

          <div class="jsc-alcohol-section grid cart__row">

          </div>

          <div class="">
            <div class="grid__item text-right" style="float:none;">
              <p>
                <span class="cart__subtotal-title">Subtotal</span>
                <span class="h3 cart__subtotal"><span class="money">$ {{formatCurrency(data.totalAmount)}}</span></span>
                <input type="hidden" class="jsc_subtotal_zapiet" value="31920">
              </p><div class="cart__shipping rte hide"><em>Tax included and shipping calculated at checkout
            </em>
            </div>
              <!-- Zapiet | Store Pickup + Delivery -->
              <div class="delivery-cart-wrapper" style="display: none">
                <div class="cart-text">


                  <h2>Delivery</h2>
                  <p>Delivery Instructions</p>



                </div>
                <div class="cart-delivery" >

                  <div class="" style="margin-bottom:25px;">


                    <div class="both-free-delivery" style="">
                      <img class="jsc-truck-icons text-center" style="vertical-align:middle;width:20px;height:20px;" src="@/assets/icons/truck_icon.svg">
                      <span class="gwp_success_both" style="font-size: 13px;font-weight:500;text-align:left !important;color:var(--el-color-primary);padding-left:2px;">Please select the delivery time!</span>
                    </div>
                  </div>
                  <p class="small-up--hide">Pick your preferred delivery slot below:</p>
                  <div id="storePickupApp">
                    <div class="checkoutMethodsContainer custom">
                      <div tabindex="0" class="checkoutMethod active">
                        <div class="checkoutMethodImage active">
                          <img alt="delivery selected" src="@/assets/images/delivery_active.png">
                        </div>
                      </div>
                      <div tabindex="0" class="checkoutMethod">
                        <div class="checkoutMethodImage">
                        </div>
                      </div>
                      <div tabindex="0" class="checkoutMethod">
                        <div class="checkoutMethodImage">
                        </div>
                      </div>
                    </div>
                    <div class="checkoutMethodContainer delivery"  >
                      <div class="ZapietStack ZapietStack--spacing-tight" style="align-items: baseline;">
                        <div class="ZapietStack-Item">
                          <el-select
                            placeholder="Choose a date and time."
                            size="large"
                            @change="handleDateChange"
                            v-model="rickupTimeData.currentDate"
                            style="width: 100%;max-height: 47px">
                            <el-option
                              v-for="(item , index) in rickupTimeData.list"
                              :key="index"
                              :label="item.date"
                              :value="item"
                            />
                          </el-select>
                        </div>
                        <div class="ZapietStack-Item" v-if="rickupTimeData.currentDate">
                          <el-select
                            placeholder="Select a time."
                            size="large"
                            v-model="rickupTimeData.currentTimes"
                            style="width: 100%;max-height: 47px">
                            <el-option
                              v-for="item in rickupTimeData.currentDate.times"
                              :key="item"
                              :label="item"
                              :value="item"
                            />

                          </el-select>
                        </div>
                      </div>
                      <p class="datePickerHelpText"></p>
                    </div>
                  </div>
                  <div class="jsc-storepickup-remove-ato-field">

                  </div>

                </div>

              </div>
              <!-- Zapiet | Store Pickup + Delivery -->

              <div class="" id="checkATO" style="display: none; color:#FF0600;">
                <span>*Please choose the order that need to add current item</span>
              </div>
              <div v-if="data.canbuy_other >=0" style="max-width:145px;" @click="toorder" class="btn cart--button-checkout jsc-fake-checkout">
                Check out 
              </div>

              <div v-else style="max-width:145px;" disabled class="btn cart--button-checkout jsc-fake-checkout ">
                差${{-data.canbuy_other}}下单
              </div>

            </div>
          </div>

          <div data-app="eastsideco_cartOffers"></div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped lang="scss">
@import "@/styles/storepickup.css";

.jsc-truck-icons {
  vertical-align:middle;
  width:20px;
  height:20px;
}
.main_shipping_msg_cart, .gwp_success_tmr-cart, .main_shipping_msg_cart_tmr{
  font-size: 15px;
  text-align:left;
  color: #73b0c9;
  font-weight: 500;
}
.gwp_success_tmr-cart {
  font-size: 15px;
  font-weight:500;
  text-align:left !important;
  color:rgb(115, 176, 201);

}


.delivery-cart-wrapper #storePickupApp .checkoutMethod:last-child{
  display: none!important;
}



</style>
