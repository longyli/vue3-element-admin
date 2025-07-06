<script setup lang="ts">
import CartAPI from "@/api/cart.api.ts";
import { onMounted, onUnmounted } from "vue";
import { getAccessToken } from "@/utils/auth";
import { formatCurrency, needAuthLogin } from "@/utils/index";
import router from "@/router";
import { useAppStore, useCommunityStore, useUserStore } from "@/store";

const userStore = useUserStore();
const userInfo = computed({
  get: () => userStore.userInfo,
});
const needAuth = ref(false);
const loadOver = ref(false);
const ariaExpanded = ref(false);
const communityStore = useCommunityStore();

const rickupTimeData = ref({
  list: [],
  currentDate: "",
  currentTimes: "",
});

const data = reactive({
  mult_carts: [],
  disUserName:'',
  pickUpAddress:'',
  pickUpCommunityName:'',
  tabList: [
    { id: 0, name: "到点自提", dispatching: "pickup", enabled: false },
    { id: 1, name: "免费配送", dispatching: "tuanz_send", enabled: false },
    { id: 2, name: "快递配送", dispatching: "express", enabled: false },
    { id: 3, name: "同城配送", dispatching: "localtown_delivery", enabled: false },
  ],
  tabIdx: 1,
  tot_price: "0.00",
  total_goods_price: "0.00",
  tabAddress: [
    {
      name: "",
      mobile: "",
    },
    {
      name: "",
      mobile: "",
      lou_meng_hao: "",
      zipCode: "",
      roadName: "",
      building: "",
      blk_no: "", //lilongyun 2020-05-28 大牌号
      receiverAddress: "",
      region: "",
    },
    {
      name: "",
      mobile: "",
      lou_meng_hao: "",
      zipCode: "",
      roadName: "",
      building: "",
      blk_no: "", //lilongyun 2020-05-28 大牌号
      receiverAddress: "",
      region: "",
    },
    {
      name: "",
      mobile: "",
      lou_meng_hao: "",
      zipCode: "",
      roadName: "",
      building: "",
      blk_no: "", //lilongyun 2020-05-28 大牌号
      receiverAddress: "",
      region: "",
    },
  ],
  goods: [],
  seller_goodss: [],
  total_quantity: 0,
  total_free: "0.00",
  trans_free_toal: "0.00",
  is_open_paynow: 0,
  is_open_yinpay: 0,
  is_open_weixin: 0,
  is_open_cash_on_delivery: 0,
  man_free_shipping: 0,
});

onMounted(() => {
  onLoad();
});

function onLoad() {
  try {
    loadOver.value = false;

    const token = getAccessToken();
    console.log("step1");
    let communityInfo = communityStore.communityInfo;
    let community_id = communityInfo.communityId || "";
    let options = router.params || {}; // 获取动态参数
    data.pickUpAddress = communityInfo.fullAddress
    data.pickUpCommunityName = communityInfo.communityName
    data.disUserName = communityInfo.disUserName

    communityStore.getCommunityById(options.community_id).then((res) => {
      console.log(res, "step2");
      if (res.code == 0) {
        if (res.open_danhead_model == 1) {
          console.log("开启单社区step7");
          community.value = res.default_head_info;
          open_danhead_model.value = res.open_danhead_model;
          token && addhistory(res.default_head_info.communityId || "");
          communityStore.changeCommunity(res.default_head_info);
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

  userStore.check_login().then((res) => {
    needAuth.value = false;
    const token = getAccessToken();
    console.log("step3");
    let communityInfo = communityStore.communityInfo;
    let community_id = communityInfo.communityId || "";
    CartAPI.checkout(token, community_id).then((res) => {

      setTimeout(function() {
        loadOver.value = true;
      }, 1000);

      let rdata = res;
      // 提货方式
      let tabIdx = -1;
      let tabLength = 0;
      let tabList = data.tabList || {};
      let sortTabList = [];

      let {
        delivery_express_name,
        delivery_tuanzshipping_name,
        delivery_ziti_name,
        delivery_diy_sort,
        delivery_type_express,
        delivery_type_tuanz,
        delivery_type_ziti,
        delivery_tuanz_money,
        is_vip_card_member,
        vipcard_save_money,
        level_save_money,
        is_open_vipcard_buy,
        is_member_level_buy,
        total_integral,
        is_need_subscript,
        need_subscript_template,
        is_hexiao,
        order_note_open,
        order_note_name,
        order_note_content,
        delivery_type_localtown,
        localtown_dispatchtime, //预计配送需要多少分钟
        pickingup_fare, //订单包装费，只有在 同城快递的时
        localtown_shipping_fare, //同城配送费
        localtown_modifypickingname,
        localtown_shipping_fare_arr,
        localtown_moneytype_fixed_freemoney,
        localtown_makeup_delivery_money,
        localtown_expected_delivery,
        is_open_paynow,
        is_open_yinpay,
        is_open_weixin,
        is_open_cash_on_delivery,
        total_quantity,
      } = res;

      data.is_open_paynow = is_open_paynow;
      data.is_open_yinpay = is_open_yinpay;
      data.is_open_weixin = is_open_weixin;
      data.is_open_cash_on_delivery = is_open_cash_on_delivery;

      // 同城满免运费
      if (localtown_shipping_fare_arr) {
        let shipping_fare = 0;
        shipping_fare = localtown_shipping_fare_arr.total_yl_shipping_fare * 1 - localtown_shipping_fare_arr.total_shipping_fare * 1;
        localtown_shipping_fare_arr.shipping_fare = shipping_fare.toFixed(2);
      }

      if (delivery_type_localtown == 1) data.tabList[3].enabled = true, tabLength++;
      if (delivery_type_express == 1) data.tabList[2].enabled = true, tabLength++;
      if (delivery_type_tuanz == 1) data.tabList[1].enabled = true, tabLength++;
      if (delivery_type_ziti == 1) data.tabList[0].enabled = true, tabLength++;

      if (delivery_diy_sort) {
        let sortArr = delivery_diy_sort.split(",");
        if (sortArr[2] && data.tabList[sortArr[2]] && data.tabList[sortArr[2]].enabled) tabIdx = sortArr[2];
        if (sortArr[1] && data.tabList[sortArr[1]] && data.tabList[sortArr[1]].enabled) tabIdx = sortArr[1];
        if (sortArr[0] && data.tabList[sortArr[0]] && data.tabList[sortArr[0]].enabled) tabIdx = sortArr[0];

        sortArr.forEach(function(item) {
          sortTabList.push(tabList[item]);
        });
      }

      delivery_express_name && (tabList[2].name = delivery_express_name);
      delivery_tuanzshipping_name && (tabList[1].name = delivery_tuanzshipping_name);
      delivery_ziti_name && (tabList[0].name = delivery_ziti_name);

      // 同城配送TODO...
      sortTabList.push({
        id: 3,
        name: "同城配送",
        dispatching: "localtown_delivery",
        enabled: (delivery_type_localtown == 1),
      });
      if (tabIdx == -1 && delivery_type_localtown == 1) tabIdx = 3;
      let localtown_delivery_space_month = "";
      if (localtown_expected_delivery && localtown_expected_delivery.localtown_delivery_space_month) {
        localtown_delivery_space_month = localtown_expected_delivery.localtown_delivery_space_month;
      }

      var addres = 0;
      addres = 1;
      var seller_chose_id = 0;
      var seller_chose_store_id = 0;
      var seller_goods = rdata.seller_goodss;

      let commentArr = {};
      for (let key in seller_goods) commentArr[key] = "";

      let sel_chose_vouche = "";
      let sgvKey = 0;
      for (let i in seller_goods) {
        if (seller_goods[i].show_voucher == 1) {
          if (seller_goods[i].chose_vouche.id) seller_chose_id = seller_goods[i].chose_vouche.id;
          if (seller_goods[i].chose_vouche.store_id) seller_chose_store_id = seller_goods[i].chose_vouche.store_id;

          if (Object.prototype.toString.call(seller_goods[i].chose_vouche) == "[object Object]") {
            sel_chose_vouche = seller_goods[i].chose_vouche;
          }
          if (Object.keys(seller_goods[i].chose_vouche).length > 0) sgvKey = i;
        }
        seller_goods[i].goodsnum = Object.keys(seller_goods[i].goods).length;
        for (var j in seller_goods[i].goods) {
          if (seller_goods[i].goods[j].header_disc > 0 && seller_goods[i].goods[j].header_disc < 100) {
            seller_goods[i].goods[j].header_disc = (seller_goods[i].goods[j].header_disc / 10).toFixed(1);
          }
        }
      }

      let current_distance = rdata.current_distance || "";
      let current_distance_str = changeDistance(current_distance);

      order_note_content = order_note_content != null ? order_note_content : "";
      let param = {
        sgvKey,
        total_quantity,
        is_hexiao: is_hexiao || false,
        loadover: true,
        commentArr,
        sel_chose_vouche,
        tabList: sortTabList,
        is_limit_distance_buy: rdata.is_limit_distance_buy || 0,
        tabIdx: tabIdx,
        tabLength: tabLength,
        tuan_send_address: rdata.tuan_send_address,
        is_open_order_message: rdata.is_open_order_message,
        is_yue_open: rdata.is_yue_open,
        can_yupay: rdata.can_yupay,
        show_voucher: rdata.show_voucher,
        current_distance,
        man_free_tuanzshipping: rdata.man_free_tuanzshipping * 1 || 0,
        man_free_shipping: rdata.man_free_shipping * 1 || 0,
        index_hide_headdetail_address: rdata.index_hide_headdetail_address || 0,
        open_score_buy_score: rdata.open_score_buy_score || 0,
        score: rdata.score || 0,
        score_for_money: rdata.score_for_money || 0,
        bue_use_score: rdata.bue_use_score || 0,
        is_man_delivery_tuanz_fare: rdata.is_man_delivery_tuanz_fare,   //是否达到满xx减团长配送费
        fare_man_delivery_tuanz_fare_money: rdata.fare_man_delivery_tuanz_fare_money,   //达到满xx减团长配送费， 减了多少钱
        is_man_shipping_fare: rdata.is_man_shipping_fare,    //是否达到满xx减运费
        fare_man_shipping_fare_money: rdata.fare_man_shipping_fare_money,   //达到满xx减运费，司机减了多少运费
        is_vip_card_member,
        vipcard_save_money,
        level_save_money,
        is_open_vipcard_buy,
        is_member_level_buy,
        // canLevelBuy,
        total_integral: total_integral || "",
        is_need_subscript,
        need_subscript_template,
        current_distance_str,
        order_note_open,
        order_note_name,
        order_note_content,
        note_content: order_note_content,
        localtown_dispatchtime,
        pickingup_fare,
        localtown_shipping_fare,
        localtown_modifypickingname: localtown_modifypickingname || "包装费",
        localtown_shipping_fare_arr,
        localtown_moneytype_fixed_freemoney,
        localtown_makeup_delivery_money,
        localtown_expected_delivery,
        localtown_delivery_space_month,
      };

      let addrObj = rdata.address || {};
      let tuan_send_address_info = rdata.tuan_send_address_info || {};
      let tuanAddress = tuan_send_address_info.address || "选择位置";
      if (tuan_send_address_info.city_name == "" || tuan_send_address_info.city_id == 3708 || tuan_send_address_info.country_name == "" || tuan_send_address_info.country_id == 3708) {
        tuanAddress = "选择位置";
      }

      param.tabAddress = [
        {
          name: rdata.ziti_name || "",
          mobile: rdata.ziti_mobile || "",
        },
        {
          name: tuan_send_address_info.name || "",
          mobile: tuan_send_address_info.telephone || "",
          receiverAddress: tuanAddress,
          lou_meng_hao: tuan_send_address_info.lou_meng_hao || "",
          region: [tuan_send_address_info.province_name || "", tuan_send_address_info.city_name || "", tuan_send_address_info.country_name || ""],
          zipCode: tuan_send_address_info.zip_code || "", //lilongyun 2020-05-28
          roadName: tuan_send_address_info.road_name || "",//lilongyun 2020-05-28
          building: tuan_send_address_info.building || "",//lilongyun 2020-05-28
          blk_no: tuan_send_address_info.blk_no || "", //lilongyun 2020-05-28 大牌号
        },
        {
          name: addrObj.name || "",
          mobile: addrObj.telephone || "",
          receiverAddress: addrObj.address || "",
          lou_meng_hao: tuan_send_address_info.lou_meng_hao || "",
          zipCode: tuan_send_address_info.zip_code || "", //lilongyun 2020-05-28
          roadName: tuan_send_address_info.road_name || "",//lilongyun 2020-05-28
          building: tuan_send_address_info.building || "",//lilongyun 2020-05-28
          blk_no: tuan_send_address_info.blk_no || "", //lilongyun 2020-05-28 大牌号
          region: [addrObj.province_name || "选择地址", addrObj.city_name || "", addrObj.country_name || ""],
        },
        {
          name: addrObj.name || "",
          mobile: addrObj.telephone || "",
          lou_meng_hao: tuan_send_address_info.lou_meng_hao || "",
          zipCode: tuan_send_address_info.zip_code || "", //lilongyun 2020-05-28
          roadName: tuan_send_address_info.road_name || "",//lilongyun 2020-05-28
          building: tuan_send_address_info.building || "",//lilongyun 2020-05-28
          blk_no: tuan_send_address_info.blk_no || "", //lilongyun 2020-05-28 大牌号
          receiverAddress: addrObj.address || "",
          region: [addrObj.province_name || "选择地址", addrObj.city_name || "", addrObj.country_name || ""],
        },
      ];

      if (JSON.stringify(addrObj) != "[]") {
        if (addrObj.lon_lat == "") {
          if (tabIdx == 3) {
            param.tabAddress[3] = {
              name: addrObj.name || "",
              mobile: addrObj.telephone || "",
              receiverAddress: "",
              region: ["选择地址", "", ""],
            };
          }
        } else if (addrObj.lon_lat) {
          let lat_lon = addrObj.lon_lat.split(",");

        }
      }

      if (addres == 1) {
        Object.assign(data, {
          ...param,
          pick_up_time: res.pick_up_time,
          pick_up_type: res.pick_up_type,
          pick_up_weekday: res.pick_up_weekday,
          addressState: true,
          is_integer: res.is_integer,
          is_ziti: res.is_ziti,
          pick_up_arr: res.pick_up_arr,
          seller_goodss: res.seller_goodss,
          seller_chose_id: seller_chose_id,
          seller_chose_store_id: seller_chose_store_id,
          goods: res.goods,
          buy_type: res.buy_type,
          yupay: res.can_yupay,
          is_yue_open: res.is_yue_open,
          yu_money: res.yu_money,
          total_free: res.total_free,
          trans_free_toal: res.trans_free_toal,
          delivery_tuanz_money: res.delivery_tuanz_money,
          reduce_money: res.reduce_money,
          is_open_fullreduction: res.is_open_fullreduction,
          cha_reduce_money: res.cha_reduce_money,
        });
      } else {
        Object.assign(data, {
          ...param,
          is_integer: res.data.is_integer,
          addressState: false,
          goods: res.data.goods,
          is_ziti: res.data.is_ziti,
          pick_up_arr: res.data.pick_up_arr,
          seller_goodss: res.data.seller_goodss,
          seller_chose_id: seller_chose_id,
          seller_chose_store_id: seller_chose_store_id,
          buy_type: res.data.buy_type,
          yupay: res.data.can_yupay,
          is_yue_open: res.data.is_yue_open,
          yu_money: res.data.yu_money,
          total_free: res.data.total_free,
          trans_free_toal: res.data.trans_free_toal,
          delivery_tuanz_money: res.data.delivery_tuanz_money,
          reduce_money: res.data.reduce_money,
          is_open_fullreduction: res.data.is_open_fullreduction,
          cha_reduce_money: res.data.cha_reduce_money,
        });
      }
      calcPrice();

    });
  }).catch((error) => {
    needAuthLogin();
    needAuth.value = true;
    setTimeout(function() {
      loadOver.value = true;
    }, 1000);
  });


}

function calcPrice(isTabSwitch = 0) {

  let {
    total_free,
    delivery_tuanz_money,
    fare_man_shipping_fare_money,
    trans_free_toal,
    tabIdx, goods,
    is_open_vipcard_buy,
    is_vip_card_member,
    fare_man_delivery_tuanz_fare_money,
    pickingup_fare,
    localtown_makeup_delivery_money,
    buy_type,
  } = data;

  total_free *= 1; //合计金额（扣除满减、优惠券，不含运费）
  delivery_tuanz_money *= 1; //配送费
  fare_man_shipping_fare_money *= 1; //免多少运费
  trans_free_toal = trans_free_toal * 1;

  let tot_price = 0; //计算后合计+运费
  // 商品总额
  let total_goods_price = 0;
  let levelAmount = 0; //等级优惠
  for (let gidx of Object.keys(goods)) {
    let item = goods[gidx];
    total_goods_price += item.total;

    if (is_open_vipcard_buy == 1 && item.is_take_vipcard == 1 && is_vip_card_member == 1) {
      // 会员优惠
    } else if (item.is_mb_level_buy) {
      levelAmount += item.total * 1 - item.level_total * 1;
    }
  }

  let total_all = total_goods_price; //总额
  // 商品总额+配送费
  if (tabIdx == 0) {
    tot_price = total_free;
  } else if (tabIdx == 1) {
    // 满免运费
    let is_man_delivery_tuanz_fare = data.is_man_delivery_tuanz_fare; //是否达到满xx减团长配送费
    if (is_man_delivery_tuanz_fare == 0) {
      tot_price = delivery_tuanz_money + total_free + fare_man_delivery_tuanz_fare_money * 1;
    } else {
      tot_price = total_free + delivery_tuanz_money;
    }
    total_all += delivery_tuanz_money;
  } else if (tabIdx == 2) {
    // 满免快递费
    let is_man_shipping_fare = data.is_man_shipping_fare; //是否达到满xx减运费
    total_all += trans_free_toal;
    if (is_man_shipping_fare == 0) {
      tot_price = trans_free_toal + total_free + fare_man_shipping_fare_money * 1;
    } else {
      if (buy_type == "pintuan") {
        tot_price = trans_free_toal + total_free + fare_man_shipping_fare_money * 1;
      } else {
        tot_price = trans_free_toal + total_free;
      }
    }
  } else if (tabIdx == 3) {
    // 同城配送
    let localtown_shipping_fare_arr = data.localtown_shipping_fare_arr;
    let total_yl_shipping_fare = localtown_shipping_fare_arr.total_yl_shipping_fare * 1 || 0;
    let total_shipping_fare = localtown_shipping_fare_arr.total_shipping_fare * 1 || 0;
    total_all += total_yl_shipping_fare;
    //包装费
    total_all += pickingup_fare * 1 + localtown_makeup_delivery_money * 1;
    tot_price = total_free + localtown_makeup_delivery_money * 1;
    tot_price += pickingup_fare * 1 + total_shipping_fare * 1;
  }

  //使用积分
  let use_score = data.use_score;
  if (isTabSwitch && use_score) {
    let score_for_money = data.score_for_money * 1;
    tot_price = tot_price - score_for_money;
  }

  let disAmount = 0; //优惠金额
  disAmount = (total_all - tot_price * 1).toFixed(2);

  let disYue = 0;
  if (data.use_yue == 1) {
    disYue = total_all > data.yu_money ? parseFloat(data.yu_money) : total_all;
    tot_price = tot_price - data.yu_money;
    if (tot_price < 0) {
      tot_price = 0;
    }
  }

  Object.assign(data, {
    total_all: total_all.toFixed(2),
    disAmount,
    disYue: disYue.toFixed(2),
    tot_price: tot_price.toFixed(2),
    total_goods_price: total_goods_price.toFixed(2),
    levelAmount: levelAmount.toFixed(2),
  });
  console.log(data);
}

function changeDistance(current_distance) {
  if (current_distance) {
    current_distance = parseFloat(current_distance);
    if (current_distance > 1000) {
      let current_distance_int = current_distance / 1000;
      return current_distance_int.toFixed(2) + "km";
    }
    return current_distance + "m";
  }
  return current_distance;
}


function goOrderfrom() {
  debugger
  let { tabAddress, tabIdx, note_content, order_note_open, order_note_name } = data;


  let t_ziti_name = tabAddress[tabIdx].name;
  let t_ziti_mobile = tabAddress[tabIdx].mobile;
  let receiverAddress = tabAddress[tabIdx].receiverAddress;
  let region = tabAddress[tabIdx].region;
  let tuan_send_address = tabAddress[tabIdx].receiverAddress;
  let lou_meng_hao = tabAddress[tabIdx].lou_meng_hao;

  let zipCode = tabAddress[tabIdx].zipCode;
  let roadName = tabAddress[tabIdx].roadName;
  let building = tabAddress[tabIdx].building;
  let delivery_date = tabAddress[tabIdx].delivery_date_str;


  if (t_ziti_name == '') {
    let tip = '请填写收货人';
    if (tabIdx == 0) tip = '请填写提货人';

    ElMessage({
      message: tip,
      type: 'warning',
    })
    return false;
  }

  if (!/^\d{8}$/.test(t_ziti_mobile) && !/^1(3|4|5|6|7|8|9)\d{9}$/.test(t_ziti_mobile)){

    ElMessage({
      message: '手机号码有误',
      type: 'warning',
    })
    return false;
  }
  if(tabIdx < 2 && order_note_open==1 && note_content=='') {

    ElMessage({
      message: '请填写' + order_note_name,
      type: 'warning',
    })
    return false;
  }

  if (0!= tabIdx && ("" == zipCode || !/^\d{6}$/.test(zipCode))) {
    ElMessage({
      message: '邮编有误',
      type: 'warning',
    })
    return false;
  }

  if (0!= tabIdx &&"" == roadName ) {
    ElMessage({
      message: '请填写道路名',
      type: 'warning',
    })
    return false;
  }

  if (0!= tabIdx &&"" == building ) {
    ElMessage({
      message: '请填写建筑名',
      type: 'warning',
    })
    return false;
  }

  if (0!= tabIdx && "" == lou_meng_hao ) {
    ElMessage({
      message: '输入楼号门牌',
      type: 'warning',
    })
    return false;
  }


  if(!delivery_date || "" == delivery_date) {
    let ter = tabIdx ==0? '请选择自提时间':'请选择配送时间';
    ElMessage({
      message: ter,
      type: 'warning',
    })
  }

  let { buy_type,tot_price } = this.data;

}

function handleDateChange(value) {
  console.log(value);
}
</script>

<template>
  <div id="app" v-loading.fullscreen.lock="!loadOver" v-if="!needAuth">
    <div id=''
         style="--swn0j0: rgb(51,51,51); --swn0j1: rgb(255,255,255); --swn0j2: rgb(30,30,30); --swn0j3: rgb(252,252,252); --swn0j4: rgb(246,246,246); --swn0j5: rgb(238,238,238); --swn0j8: rgb(104,104,104); --swn0j9: rgb(51,51,51); --swn0jb: rgb(30,30,30); --swn0ja: rgb(30,30,30); --swn0jc: rgb(255,255,255); --swn0jd: rgb(255,255,255); --swn0je: rgb(242,108,79); --swn0jg: rgb(254,244,244); --swn0jh: rgb(253,237,236); --swn0ji: rgb(250,220,216); --swn0jj: rgb(255,255,255); --swn0jk: rgba(255,255,255,0.66); --swn0jl: rgb(190,74,44); --swn0jf: rgb(239,95,58); --swn0jm: rgb(53,15,6); --swn0jn: rgb(87,30,15); --swn0jo: rgba(53,15,6,0.1); --swn0j1t: rgb(255,255,255); --swn0j1v: rgb(223,223,223); --swn0j1u: rgb(0,0,0); --swn0j28: rgb(255,255,255); --swn0j29: rgb(246,246,246); --swn0j2a: rgba(0,0,0,0.045); --swn0j2b: rgb(145,145,145); --swn0j2c: rgb(255,255,255); --swn0j2d: rgba(0,0,0,0.56); --swn0j2e: rgba(0,0,0,0.1); --swn0j24: rgba(51,51,51,0.05); --swn0j2g: rgb(202,79,48); --swn0j2h: rgb(0,0,0); --swn0j2i: rgb(81,96,79); --swn0j2j: rgb(95,58,0); --swn0j2v: rgba(51,51,51,0.05); --swn0j3i: rgba(51,51,51,0.05); --swn0j1n: rgb(230,246,254); --swn0j1p: rgb(184,217,232); --swn0j5j: rgb(0,0,0); --swn0j5x: rgb(249,253,255); --swn0j1o: rgb(210,239,253); --swn0j5z: rgba(0,0,0,0.045); --swn0j60: rgb(103,140,155); --swn0j1q: rgb(255,255,255); --swn0j1r: rgba(0,0,0,0.56); --swn0j1s: rgba(0,0,0,0.1); --swn0j5t: rgba(51,51,51,0.05); --swn0j65: rgb(186,72,43); --swn0j66: rgb(0,0,0); --swn0j67: rgb(81,96,79); --swn0j68: rgb(95,58,0); --swn0j6k: rgba(51,51,51,0.05); --swn0j77: rgba(51,51,51,0.05); --swn0j9i: rgba(51,51,51,0.05); --swn0j9u: rgb(202,79,48); --swn0ja9: rgba(51,51,51,0.05); --swn0jaw: rgba(51,51,51,0.05); --swn0jd7: rgba(51,51,51,0.05); --swn0jdj: rgb(202,79,48); --swn0jdy: rgba(51,51,51,0.05); --swn0jel: rgba(51,51,51,0.05);">
      <div class="g9gqqf1 g9gqqf0 _1fragemo7 g9gqqfc g9gqqfa _1fragemtg g9gqqf6 g9gqqf2 _1fragemnh _1fragemnl">
        <div class="_1fragem1y _1fragemlo">
          <div class="_1fragem1y _1fragemlo"><a href="#checkout-main" class="_9sntZ">Skip to content</a>
            <div class="cm5pp U3Rye FeQiM oYrwu _1fragemnl _1fragemnh _1fragemtg">
              <header class="EAjaz _8wrz5 d5pfT _1fragemtg _1fragemnl _1fragemnh">
                <div class="i8Dpn">
                  <div>
                    <div>
                      <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem41 _1fragem5u">
                        <div
                          class="_1mrl40q0 _1fragemlo _1fragemmf _1fragemmm _1fragem2x _1fragem4l _1fragem6e _1fragemm8 _16s97g7f _16s97g7p _16s97g71j _16s97g71t    _16s97g79l"
                          style="--_16s97g7a: 1fr; --_16s97g7k: minmax(0, 1fr); --_16s97g71e: minmax(auto, max-content) minmax(0, 1fr) minmax(auto, max-content); --_16s97g71o: minmax(0, 1fr);">
                          <div style="visibility: hidden;">
                            <span>
                              <router-link aria-label="Cart" id="cart-link"
                                           to="ulink_comshop/pages/order/shopCart"
                                           class="s2kwpi1 s2kwpi0 _1fragemlo _1fragemsx _1fragemt3 _1fragemsr s2kwpi2 s2kwpi5 s2kwpi4 _1fragemso s2kwpi9 s2kwpi7 _1fragem1y _1fragemor">
                                <span
                                  class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wus a8x1wuo a8x1wuw">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false"
                                      aria-hidden="true"
                                      class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx">
                                    <path
                                      d="m2.007 10.156.387-4.983a1 1 0 0 1 .997-.923h7.218a1 1 0 0 1 .997.923l.387 4.983c.11 1.403-1.16 2.594-2.764 2.594H4.771c-1.605 0-2.873-1.19-2.764-2.594"></path>
                                    <path
                                      d="M5 3.5c0-1.243.895-2.25 2-2.25S9 2.257 9 3.5V5c0 1.243-.895 2.25-2 2.25S5 6.243 5 5z"></path>
                                  </svg>
                                </span>
                              </router-link>
                            </span>
                          </div>
                          <div class="_197l2oft _1fragemny _1fragemmm _1fragem28 _1fragemlo">
                            <div class="_1fragem1y _1fragemlo _16s97g73r" style="--_16s97g73m: 16.1rem;">
                              <span>
                                <router-link
                                  to="/ulink_comshop/pages/index/index"
                                  class="s2kwpi1 s2kwpi0 _1fragemlo _1fragemsx _1fragemt3 _1fragemsr s2kwpi3 s2kwpi6 s2kwpi9 s2kwpi7 _1fragem1y _1fragemor">
                                  <img
                                    src="@/assets/images/logo-header-order.png" class="gP50U">
                                </router-link>
                              </span>
                            </div>
                          </div>
                          <span>
                            <router-link aria-label="Cart" id="cart-link" to="/ulink_comshop/pages/order/shopCart"
                                         class="s2kwpi1 s2kwpi0 _1fragemlo _1fragemsx _1fragemt3 _1fragemsr s2kwpi2 s2kwpi5 s2kwpi4 _1fragemso s2kwpi9 s2kwpi7 _1fragem1y _1fragemor">
                              <span
                                class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wus a8x1wuo a8x1wuw"><svg
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false"
                                aria-hidden="true"
                                class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                d="m2.007 10.156.387-4.983a1 1 0 0 1 .997-.923h7.218a1 1 0 0 1 .997.923l.387 4.983c.11 1.403-1.16 2.594-2.764 2.594H4.771c-1.605 0-2.873-1.19-2.764-2.594"></path><path
                                d="M5 3.5c0-1.243.895-2.25 2-2.25S9 2.257 9 3.5V5c0 1.243-.895 2.25-2 2.25S5 6.243 5 5z"></path></svg></span></router-link></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              <aside class="nMPKH iYA3J">
                <button aria-controls="disclosure_details" aria-expanded="false" class="WtpiW"
                        @click="ariaExpanded = !ariaExpanded">
                  <span class="smIFm">
                    <span class="_4ptW6">
                      <span class="fCEli">Order summary</span>
                      <span
                        class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wun a8x1wul _1fragem2i _1fragemt9 a8x1wup a8x1wuo a8x1wuw">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false" aria-hidden="true"
                             class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx">
                          <path stroke-linecap="round" v-if="!ariaExpanded" stroke-linejoin="round"
                                d="M12 4.75 7.354 9.396a.5.5 0 0 1-.708 0L2 4.75"></path>
                          <path stroke-linecap="round" v-else stroke-linejoin="round"
                                d="m2 9.25 4.646-4.646a.5.5 0 0 1 .708 0L12 9.25"></path>
                        </svg>
                      </span>
                    </span>
                    <span>
                      <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem6o _1fragemot">
                        <span class="_19gi7yt1n _19gi7yt1m _1fragemsj">Original price</span>
                        <p translate="no"
                           class="_1tx8jg70 _1fragemlo _1tx8jg7g _1tx8jg7f _1fragemo9 _1tx8jg715 _1tx8jg71d _1tx8jg71f notranslate">
                          <strong class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1l">${{ formatCurrency(data.tot_price)
                            }}</strong>
                        </p>
                      </div>
                    </span>
                  </span>
                </button>
                <div id="disclosure_details"
                     class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbd _94sxtb6 _1fragemst"
                     :style="{height: ariaExpanded ? 'auto' : '0px', overflow: ariaExpanded ? 'visible' : '' } ">
                  <div>
                    <div class="ks0CH _1fragemnl _1fragemni _1fragemtg">
                      <div class="GRdxR">
                        <div>
                          <section
                            class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                            style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                            <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z"><h2
                              class="n8k95wh _1fragemsj">Order summary</h2>
                              <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z">
                                <section
                                  class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                  style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                  <div class="_1mjy8kn6 _1fragemlo _16s97g73k" style="--_16s97g73f: 40vh;">
                                    <div tabindex="0" role="group" scrollbehaviour="chain"
                                         class="_1mjy8kn1 _1mjy8kn0 _1fragemlo _1fragemoq _1fragem1t _1fragemel _1fragemhs _1fragemci _1fragemjl _16s97g73k _1mjy8kn4 _1mjy8kn2 _1fragemjq _1fragemk5"
                                         style="--_16s97g73f: 40vh;">
                                      <div class="_6zbcq522 _1fragemsj"><h3 id="ResourceList1"
                                                                            class="n8k95w1 n8k95w0 _1fragemlo n8k95w4 n8k95wg">
                                        Shopping cart</h3></div>
                                      <div role="table" aria-labelledby="ResourceList1"
                                           class="_6zbcq56 _6zbcq55 _1fragem28 _1fragemny _6zbcq5o _6zbcq5c _1fragem3w _6zbcq516">
                                        <div role="rowgroup"
                                             class="_6zbcq54 _6zbcq53 _1fragem28 _1fragemny _6zbcq51d _6zbcq51c _1fragemsj">
                                          <div role="row"
                                               class="_6zbcq51f _6zbcq51e _1fragem28 _1fragemmm _1fragemoq _1fragem5p">
                                            <div role="columnheader" class="_6zbcq522 _1fragemsj">Product image</div>
                                            <div role="columnheader" class="_6zbcq522 _1fragemsj">Description</div>
                                            <div role="columnheader" class="_6zbcq522 _1fragemsj">Quantity</div>
                                            <div role="columnheader" class="_6zbcq522 _1fragemsj">Price</div>
                                          </div>
                                        </div>
                                        <div v-for="(seller_goods) in data.seller_goodss " role="rowgroup"
                                             class="_6zbcq54 _6zbcq53 _1fragem28 _1fragemny">

                                          <div v-for="(item , index) in seller_goods.goods" role="row"
                                               class="_6zbcq51i _6zbcq51h _1fragem28 _1fragem1t _6zbcq51l _6zbcq510 _6zbcq51k">
                                            <div role="cell"
                                                 class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51t _6zbcq51q _1fragem7s _6zbcq51o">
                                              <div class="_1fragem1y _1fragemlo _16s97g74b"
                                                   style="--_16s97g746: 6.4rem;">
                                                <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7d">
                                                  <div
                                                    class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmj _1fragemmq _1fragem3w _1fragem5p _1fragem7d">
                                                    <div
                                                      class="_1m6j2n34 _1m6j2n33 _1fragemlo _1fragemtk _1m6j2n3a _1m6j2n39 _1m6j2n35"
                                                      style="--_1m6j2n30: 1;">
                                                      <picture>
                                                        <img
                                                          :src="item.image"
                                                          loading="eager"
                                                          alt="Fresh chicken livers with some flour from Sasha's Fine Foods"
                                                          class="_1h3po425 _1h3po424 _1fragem1y _1fragemkk _1fragemka _1h3po426 _1fragemp2 _1fragemp0 _1fragemp4 _1fragemoy _1fragemq3 _1fragempz _1fragemq7 _1fragempv _1fragembe _1fragemau _1fragemby _1fragemaa _1fragemkz _1m6j2n3c _1fragemoq _1fragem1t _1m6j2n35">
                                                      </picture>
                                                      <div class="_1m6j2n3m _1m6j2n3l _1fragemle">
                                                        <div
                                                          class="_99ss3s1 _99ss3s0 _1fragemmm _1fragem73 _1fragemor _99ss3s6 _99ss3s2 _1fragem28 _99ss3sh _99ss3sc _99ss3sa _1fragemi7 _1fragemge _99ss3su _99ss3sp _1fragempa _1fragempg _1fragemps _1fragempm">
                                                          <span
                                                            class="_99ss3sw _1fragemsj">Quantity</span><span>{{ item.quantity
                                                          }}</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div role="cell"
                                                 class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51p _6zbcq51n _1fragemms _6zbcq51x _6zbcq51w _1fragemo1 _16s97g741"
                                                 style="--_16s97g73w: 6.4rem;">
                                              <div class="_1fragem1y _1fragemlo dDm6x"><p
                                                class="_1tx8jg70 _1fragemlo _1tx8jg7c _1tx8jg7b _1fragemo7 _1tx8jg715 _1tx8jg71d _1tx8jg71f">
                                                {{ item.name_en }}</p>
                                                <div
                                                  class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem6o"></div>
                                              </div>
                                            </div>
                                            <div role="cell"
                                                 class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51o _6zbcq51y">
                                              <div class="_6zbcq522 _1fragemsj"><span
                                                class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">1</span></div>
                                            </div>
                                            <div role="cell"
                                                 class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51p _6zbcq51n _1fragemms">
                                              <div class="_197l2oft _1fragemny _1fragemmo _1fragem28 _1fragemlo Byb5s">
                                                <span translate="no"
                                                      class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">${{ formatCurrency(item.total)
                                                  }}</span>
                                              </div>
                                            </div>
                                          </div>

                                        </div>
                                      </div>
                                    </div>
                                    <div aria-hidden="true"
                                         class="_1r4exbt7 _1r4exbt6 _1fragemeq _1fragemcx _1fragemim _1fragemgt _1fragemle _1fragem28 _1fragemmm _1fragemqk _1fragemsi _1r4exbta _1r4exbt8 _1fragemrk _1r4exbt5">
                                      Scroll for more items<span
                                      class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wuq a8x1wuo a8x1wuw"><svg
                                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false"
                                      aria-hidden="true"
                                      class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                      stroke-linecap="round" stroke-linejoin="round"
                                      d="M7 1.5v11m0 0 4.75-3.826M7 12.5 2.25 8.674"></path></svg></span></div>
                                  </div>
                                </section>
                              </div>

                              <section
                                class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                <div class="nfgb6p2 _1fragemsj"><h3 id="MoneyLine-Heading2"
                                                                    class="n8k95w1 n8k95w0 _1fragemlo n8k95w4 n8k95wg">
                                  Cost summary</h3></div>
                                <div role="table" aria-labelledby="MoneyLine-Heading2">
                                  <div role="rowgroup" class="nfgb6p2 _1fragemsj">
                                    <div role="row">
                                      <div role="columnheader">Item</div>
                                      <div role="columnheader">Value</div>
                                    </div>
                                  </div>
                                  <div role="rowgroup" class="nfgb6p1 nfgb6p0 _1fragem2x nfgb6p3">
                                    <div role="row"
                                         class="_1qy6ue60 _1qy6ue69 _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                      <div role="rowheader" class="_1qy6ue6b"><span
                                        class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Subtotal · {{ data.total_quantity
                                        }} items</span>
                                      </div>
                                      <div role="cell" class="_1qy6ue6c"><span translate="no"
                                                                               class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">${{ formatCurrency(data.total_goods_price)
                                        }}</span>
                                      </div>
                                    </div>
                                    <div role="row"
                                         class="_1qy6ue60 _1qy6ue69 _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                      <div role="rowheader" class="_1qy6ue6b">
                                        <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                          <div
                                            class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmf _1fragemmm _1fragem3c _1fragem55 _1fragem7s">
                                            <span class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Delivery</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div role="cell" class="_1qy6ue6c">
                                        <span translate="no"
                                              class="_19gi7yt0 _19gi7yt4 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">+ ${{ data.trans_free_toal
                                          }}</span>
                                      </div>
                                    </div>
                                    <div role="row" class="_1x41w3p1 _1x41w3p0 _1fragem2x _1fragemmm _1x41w3p2">
                                      <div role="rowheader" class="_1x41w3p6"><strong
                                        class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l">Total</strong>
                                      </div>
                                      <div role="cell" class="_1x41w3p7">
                                        <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                          <div
                                            class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemml _1fragem3h _1fragem5a _1fragem7s">
                                            <abbr class="_1qifbzv1 _1qifbzv0 _1fragemsn">
                                              <span translate="no"
                                                    class="_19gi7yt0 _19gi7yte _19gi7ytd _1fragemo6 _19gi7yt12 _19gi7yt1b _19gi7yt1g notranslate">SGD</span>
                                            </abbr>
                                            <strong translate="no"
                                                    class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l notranslate">${{ formatCurrency(data.tot_price)
                                              }}</strong>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div role="row"
                                         class="_1qy6ue60 _1qy6ue69 _1qy6ue64 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                      <div role="rowheader" class="_1qy6ue6b">
                                        <p class="_1tx8jg70 _1fragemlo _1tx8jg715 _1tx8jg71e _1tx8jg71f">
                                          <span class="go06b0">
                                            <span>

                                            </span>
                                          </span>
                                        </p>
                                      </div>
                                      <div role="cell" class="_1qy6ue6c"></div>
                                    </div>
                                  </div>
                                </div>
                              </section>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
              <div class="Sxi8I">
                <div class="_9F1Rf GI5Fn _1fragemnl _1fragemng _1fragemto">
                  <div class="gdtca">
                    <main id="checkout-main" class="djSdi"><h1 class="_1fragemsj">Sasha's Fine Foods Checkout</h1>
                      <div
                        class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem47 _1fragem6o _1fragem60">
                          <div class="km09ry1 _1fragemlo">
                            <div>
                              <section
                                class="_17kya4ui _17kya4ug _1fragemnl _17kya4up _17kya4uk _1fragemnh _1fragemtg _1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemf0 _1fragemg0 _1fragemh3 _1fragemht _1fragemd7 _1frageme7 _1fragemiw _1fragemjm _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">

                                <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem6o">
                                  <div class="_1fragem1y _1fragemlo">
                                    <div class="ILN3z">
                                      <div id="contact"
                                           class="_1fragem1y _1fragemf0 _1fragemhs _1fragemd7 _1fragemjl _1fragemlo">
                                        <h2 class="n5gP0">
                                          <button type="button" aria-busy="false" id="contact-collapsible" lang=''
                                                  aria-controls="contact-collapsible-control" aria-expanded="false"
                                                  class="_1s82kpb1 _1s82kpb0 _1fragemnv _1fragemlo _1fragemsm _1fragemsx _1fragemss _1fragemt7 _1fragemsg _1fragemto _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _16s97g791 _16s97g73r _16s97g74b _16s97g741"
                                                  style="--_16s97g73m: none; --_16s97g746: 100%; --_16s97g73w: 0;">
                                            <div
                                              class="_1mrl40q0 _1fragemlo _1fragemmf _1fragemmm _1fragem2x _1fragem3w _1fragem5p _1fragemm3 _1fragem7s _1fragemou _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                              style="--_16s97g7a: 1fr; --_16s97g7k: minmax(0, 1fr); --_16s97g71e: minmax(0, 1fr) minmax(auto, max-content); --_16s97g71o: minmax(0, 1fr);">
                                              <span class="wSTmt"><span
                                                class="_19gi7yt0 _19gi7yt12 _19gi7yt1b _19gi7yt1g">Account</span></span>
                                              <div
                                                class="_1fragem1y _1fragemfz _1fragemeo _1fragemhs _1fragemgh _1frageme6 _1fragemcv _1fragemjl _1fragemia _1fragemlo gxa2t">
                                                <span
                                                  class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wub a8x1wu3 _1fragemna a8x1wum a8x1wuk _1fragem1y a8x1wup a8x1wuo a8x1wuw"><svg
                                                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
                                                  focusable="false" aria-hidden="true"
                                                  class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                                  stroke-linecap="round" stroke-linejoin="round"
                                                  d="M12 4.75 7.354 9.396a.5.5 0 0 1-.708 0L2 4.75"></path></svg></span>
                                              </div>
                                            </div>
                                            <div
                                              class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem6o _1fragemou">
                                              <div class="_7Vwjr"
                                                   style="opacity: 1; transition-delay: 0ms; height: auto;">
                                                <div class="tq3Uk"><span
                                                  class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">{{ userInfo.username
                                                  }}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </button>
                                          <div style="height: 0px; transition-duration: 0ms;"></div>
                                        </h2>
                                        <div class="oNgGT"
                                             style="margin-top: -26px; padding-bottom: 0px; min-height: 26px; opacity: 0; pointer-events: none; transition-delay: 0ms;">
                                          <div id="contact-collapsible-control"
                                               class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbb _94sxtb4 _1fragemsr"
                                               style="height: 0px;" hidden=''>
                                            <div></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div></div>
                                </div>

                              </section>
                              <div class="_1fragem1y _1fragemlo gfFXW">
                                <div class="_16s97g74v _16s97g760"></div>
                              </div>
                            </div>
                            <div>
                              <div>
                                <section
                                  class="_17kya4ui _17kya4ug _1fragemnl _17kya4up _17kya4uk _1fragemnh _1fragemtg _1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemf0 _1fragemg0 _1fragemh3 _1fragemht _1fragemd7 _1frageme7 _1fragemiw _1fragemjm _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                  style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                  <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">

                                    <div
                                      v-for="seller in data.seller_goodss"
                                      class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                      <h3 class="n8k95w1 n8k95w0 _1fragemlo n8k95w3 n8k95wg">Shipping method</h3>
                                      <div class="amyhxvd amyhxvf amyhxvg">

                                        <div
                                          v-for="item in data.tabList"
                                          v-show="item.enabled"
                                          class="amyhxvi amyhxvj amyhxvk amyhxvm amyhxvq amyhxvo _1fragemnm _1fragemtg">
                                          <div
                                            @click="data.tabIdx = item.id"
                                            :class="['amyhxvv amyhxvu _1fragemlo _1fragem2x _1fragem5k amyhxvy _1fragemnv amyhxvz amyhxv12 amyhxv10 amyhxv11  _1fragemtg amyhxv1g amyhxvw',data.tabIdx == item.id?'_1fragemnn' :'']">
                                            <div class="_6hzjvo2 _1fragemlo">
                                              <input type="radio"
                                                     v-model="data.tabIdx" :value="item.id"
                                                     :checked="data.tabIdx == item.id"
                                                     name="billing_address_selector"
                                                     class="_6hzjvo4 _6hzjvo3 _1fragemnv _1fragem1y _1fragemsx _1fragemsr _1fragemt4 _6hzjvo8 _6hzjvo6 _1fragemtg">
                                            </div>
                                            <div><label for="billing_address_selector-custom_billing_address"
                                                        data-option-selected="true" class="amyhxv15 _1fragemnv">{{item.name}} </label></div>
                                          </div>
                                          <div
                                            v-if="item.id == 1 || item.id == 2"
                                               class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbd _94sxtb6 _1fragemst"
                                               :style="{height: data.tabIdx == item.id ? 'auto': '0px',overflow:data.tabIdx == item.id ? 'visible': '' }" >
                                            <div>
                                              <div class="amyhxv1b amyhxv1d amyhxv1f">
                                                <div class="km09ry1 _1fragemlo">
                                                  <div id="billingAddressForm">
                                                    <div aria-hidden="false" aria-busy="false" class="r62YW">
                                                      <div
                                                        v-if="item.id == 1"
                                                        class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">

                                                      </div>
                                                      <el-row
                                                        v-if="item.id == 2"
                                                        :gutter="20">
                                                        <el-col :span="16">
                                                          快送费 ${{seller.store_shipping_fare}}（满${{formatCurrency(data.man_free_shipping)}} 以上免快送费）
                                                        </el-col>

                                                      </el-row>

                                                    </div>
                                                  </div>
                                                </div>

                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3c _1fragem55"><h2
                                      id="deliveryAddress" class="n8k95w1 n8k95w0 _1fragemlo n8k95w2 n8k95wg">
                                      Delivery</h2></div>
                                    <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4b _1fragem64">
                                      <section aria-label="Shipping address"
                                               class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                               style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                        <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                          <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4b _1fragem64">
                                            <div
                                              class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                              <div>
                                                <div id="shippingAddressForm">
                                                  <div aria-hidden="false" aria-busy="false" class="r62YW">

                                                    <div
                                                      class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">



                                                      <div
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="wfKnD IGF4z">
                                                          <div
                                                            class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3m _1fragem5f">
                                                            <div>
                                                              <div
                                                                class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                                <div class="cektnc0 _1fragemlo cektnc5"><label
                                                                  id="shipping-address1-label" for="shipping-address1"
                                                                  class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                                  class="cektnca"><span
                                                                  class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Consignee Name</span></span></label>
                                                                  <div
                                                                    class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                    <input
                                                                           placeholder="Consignee Name"
                                                                           type="text"
                                                                           v-model="data.tabAddress[data.tabIdx].name"
                                                                           class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2uv _7ozb2uu _1fragempc _1fragempo _7ozb2u11 _7ozb2u1j _7ozb2ur">

                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div
                                                          class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                          <div class="cektnc0 _1fragemlo cektnc5"><label
                                                            id="TextField4-label" for="TextField4"
                                                            class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                            class="cektnca"><span
                                                            class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Phone</span></span></label>
                                                            <div
                                                              class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                              <input
                                                                     v-model="data.tabAddress[data.tabIdx].mobile"
                                                                     placeholder="Phone"
                                                                     required='' type="tel"
                                                                     class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2uv _7ozb2uu _1fragempc _1fragempo _7ozb2u10 _7ozb2u1j _7ozb2ur">
                                                              <div
                                                                class="_7ozb2u1h _7ozb2u1g _1fragemlo _1fragemtb _1fragemmt _1fragemnt _7ozb2u1i">
                                                                <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                                                  <div
                                                                    class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmf _1fragemmm _1fragem3w _1fragem5p _1fragem7s">
                                                                    <el-tooltip
                                                                      content="<span>In case we need to contact you about your order</span>"
                                                                      raw-content>
                                                                      <button type="button" aria-busy="false"
                                                                              aria-label="More information" lang=''
                                                                              class="_1s82kpb1 _1s82kpb0 _1fragemnv _1fragemlo _1fragemsm _1fragemsx _1fragemss _1fragemt7 _1fragemsg _1fragemto _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _16s97g791 _16s97g73r _16s97g74b _16s97g741"
                                                                              style="--_16s97g73m: none; --_16s97g746: 0; --_16s97g73w: 0;">
                                                                      <span
                                                                        class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wur a8x1wuo a8x1wuw"><svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 14 14" focusable="false"
                                                                        aria-hidden="true"
                                                                        class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx">
                                                                        <g clip-path="url(#a)">
                                                                          <circle cx="7" cy="7" r="5.5"></circle>
                                                                          <path stroke-linejoin="round"
                                                                                d="M6.99 10.24h.02v.02h-.02z"></path>
                                                                          <path stroke-linecap="round"
                                                                                d="M5.5 5.25a1.5 1.5 0 1 1 2.428 1.179C7.494 6.77 7 7.198 7 7.75"></path>
                                                                        </g>
                                                                        <defs>
                                                                          <clipPath id="a">
                                                                            <path fill="#fff" d="M0 0h14v14H0z"></path>
                                                                          </clipPath>
                                                                        </defs>
                                                                      </svg>
                                                                      </span>
                                                                      </button>
                                                                    </el-tooltip>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>


                                                      <div
                                                        v-if="data.tabIdx != 0"
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="hDo51">
                                                          <div
                                                            class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                            <div class="cektnc0 _1fragemlo cektnc5"><label
                                                              id="TextField3-label" for="TextField3"
                                                              class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                              class="cektnca"><span
                                                              class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Postal code</span></span></label>
                                                              <div
                                                                class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                <input
                                                                       v-model="data.tabAddress[data.tabIdx].zipCode"
                                                                       type="text"
                                                                       class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2u11 _7ozb2u1j _7ozb2ur">
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div
                                                        v-if="data.tabIdx != 0"
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="hDo51">
                                                          <div
                                                            class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                            <div class="cektnc0 _1fragemlo cektnc5"><label
                                                              id="TextField3-label" for="TextField3"
                                                              class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                              class="cektnca"><span
                                                              class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Blk No.</span></span></label>
                                                              <div
                                                                class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                <input
                                                                       v-model="data.tabAddress[data.tabIdx].blk_no"
                                                                       placeholder="Blk No." required='' type="text"
                                                                       class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2u11 _7ozb2u1j _7ozb2ur">
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div
                                                        v-if="data.tabIdx != 0"
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="hDo51">
                                                          <div
                                                            class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                            <div class="cektnc0 _1fragemlo cektnc5"><label
                                                              id="TextField3-label" for="TextField3"
                                                              class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                              class="cektnca"><span
                                                              class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Road Name</span></span></label>
                                                              <div
                                                                class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                <input
                                                                  placeholder="Road Name" type="text"
                                                                  v-model="data.tabAddress[data.tabIdx].roadName"
                                                                  class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2u11 _7ozb2u1j _7ozb2ur">
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div
                                                        v-if="data.tabIdx != 0"
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="hDo51">
                                                          <div
                                                            class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                            <div class="cektnc0 _1fragemlo cektnc5"><label
                                                              id="TextField3-label" for="TextField3"
                                                              class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                              class="cektnca"><span
                                                              class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Unit Number</span></span></label>
                                                              <div
                                                                class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                <input
                                                                  placeholder="Unit Number" type="text"
                                                                  v-model="data.tabAddress[data.tabIdx].lou_meng_hao"
                                                                  class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2u11 _7ozb2u1j _7ozb2ur">
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div
                                                        v-if="data.tabIdx != 0"
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="hDo51">
                                                          <div
                                                            class="_7ozb2u2 _7ozb2u1 _1fragem3c _1fragem55 _1fragemlo _1fragem2x _10vrn9p1 _10vrn9p0 _10vrn9p4 _7ozb2u4 _7ozb2u3 _1fragemnm">
                                                            <div class="cektnc0 _1fragemlo cektnc5"><label
                                                              id="TextField3-label" for="TextField3"
                                                              class="cektnc3 cektnc1 _1fragemle _1fragemsi _1fragemtb _1fragemsx _1fragemss _1fragemt7 _1fragemt8"><span
                                                              class="cektnca"><span
                                                              class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Building</span></span></label>
                                                              <div
                                                                class="_7ozb2u6 _7ozb2u5 _1fragemlo _1fragem2x _1fragemnw _1fragemsx _1fragemss _1fragemt7 _1fragemta _7ozb2uc _7ozb2ua _1fragemnm _1fragemtg _7ozb2ul _7ozb2uh">
                                                                <input
                                                                  placeholder="Building" type="text"
                                                                  v-model="data.tabAddress[data.tabIdx].building"
                                                                  class="_7ozb2uq _7ozb2up _1fragemlo _1fragemtb _1fragemoq _1fragemsh _7ozb2ut _7ozb2us _1fragemsx _1fragemss _1fragemt7 _7ozb2u11 _7ozb2u1j _7ozb2ur">
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>


                                                      <div
                                                        class="_1mrl40q0 _1fragemlo _1fragem2x _1fragem3w _1fragem5p _1fragemm8 _1fragemm4 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                        style="--_16s97g7a: minmax(0, 1fr); --_16s97g7k: minmax(auto, max-content); --_16s97g71e: minmax(0, 1fr); --_16s97g71o: minmax(auto, max-content);">
                                                        <div class="RD23h _1k3449n1 _1k3449n0 _1fragemnm _10vrn9p1 _10vrn9p0 _10vrn9p4">
                                                          <div class="VZudx _1k3449n1 _1k3449n0 _1fragemnm">
                                                            <label
                                                              for="Select0" class="QCxaD A9HkF">
                                                                <span class="XDBWz">
                                                                  <span
                                                                    class="rermvf1 rermvf0 _1fragemjv _1fragemk5 _1fragem1y">Choose a date and time.</span>
                                                                </span>
                                                            </label>
                                                            <select class="ZHJU6 _1k3449n5 _1k3449n3 _1fragemtg oAlPg IWR5K tu1VS">
                                                              <option  value="SG">Singapore</option>
                                                            </select>
                                                            <div class="VXrUd"><span
                                                              class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wup a8x1wuo a8x1wuw"><svg
                                                              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"
                                                              focusable="false" aria-hidden="true"
                                                              class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                                              stroke-linecap="round" stroke-linejoin="round"
                                                              d="M12 4.75 7.354 9.396a.5.5 0 0 1-.708 0L2 4.75"></path></svg></span>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>




                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>





                                          </div>
                                        </div>
                                      </section>
                                    </div>
                                  </div>
                                </section>
                                <div class="_1fragem1y _1fragemlo gfFXW">
                                  <div class="_16s97g74v _16s97g760"></div>
                                </div>
                              </div>
                            </div>
                            <div class="_1fragem1y _1fragemlo">
                              <div>
                                <div>
                                  <section
                                    class="_17kya4ui _17kya4ug _1fragemnl _17kya4up _17kya4uk _1fragemnh _1fragemtg _1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemf0 _1fragemg0 _1fragemh3 _1fragemht _1fragemd7 _1frageme7 _1fragemiw _1fragemjm _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                    style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                    <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                      <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3c _1fragem55">
                                        <h2 id="payment" class="n8k95w1 n8k95w0 _1fragemlo n8k95w2 n8k95wg">Payment</h2>
                                        <p class="_1tx8jg70 _1fragemlo _1tx8jg715 _1tx8jg71e _1tx8jg71f">All
                                          transactions are secure and encrypted.</p></div>
                                      <section
                                        class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                        style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                        <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4g _1fragem69">
                                          <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4b _1fragem64">
                                            <div
                                              class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                              <div>
                                                <div
                                                  class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                                  <div class="amyhxvd amyhxvf amyhxvg">
                                                    <div
                                                      class="amyhxvi amyhxvj amyhxvk amyhxvm amyhxvq amyhxvo _1fragemnm _1fragemtg">
                                                      <div
                                                        class="amyhxvv amyhxvu _1fragemlo _1fragem2x _1fragem5k amyhxvy _1fragemnv amyhxvz amyhxv12 amyhxv10 amyhxv11 _1fragemnn _1fragemtg amyhxv1g amyhxvw amyhxvx">
                                                        <div class="amyhxv1i amyhxv1h _1fragemmt _1fragem28 _1fragem5k">
                                                          <div class="_6hzjvo2 _1fragemlo">
                                                            <input type="radio"
                                                                   id="basic-HitPay - QR Code, E-wallets and Cards"
                                                                   name="basic"
                                                                   class="_6hzjvo4 _6hzjvo3 _1fragemnv _1fragem1y _1fragemsx _1fragemsr _1fragemt4 _6hzjvo8 _6hzjvo6 _1fragemtg">
                                                          </div>
                                                          <label for="basic-HitPay - QR Code, E-wallets and Cards"
                                                                 data-option-selected="true"
                                                                 class="amyhxv15 _1fragemnv"><span
                                                            class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">UQPay - QR Code, E-wallets and Cards</span></label>
                                                        </div>
                                                        <div>
                                                          <div class="mpn0m">
                                                            <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                                              <div
                                                                class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmf _1fragemmm _1fragem3c _1fragem55 _1fragem7s">
                                                                <img alt="paynow"
                                                                     src="@/assets/icons/paynow.DcakwFGm.svg"
                                                                     role="img" width="38" height="24"
                                                                     class="_1tgdqw61 _1tgdqw60 _1fragemsx _1fragemss _1fragemt7 _1tgdqw66"><img
                                                                alt="atome"
                                                                src="@/assets/icons/atome.CyyJOoYg.svg"
                                                                role="img" width="38" height="24"
                                                                class="_1tgdqw61 _1tgdqw60 _1fragemsx _1fragemss _1fragemt7 _1tgdqw66"><img
                                                                alt="unionpay"
                                                                src="@/assets/icons/unionpay.8M-Boq_z.svg"
                                                                role="img" width="38" height="24"
                                                                class="_1tgdqw61 _1tgdqw60 _1fragemsx _1fragemss _1fragemt7 _1tgdqw66">
                                                                <div class="_123qrzt0 _1fragem23 _123qrzt1 _123qrzt2">
                                                                  <img alt="gcash"
                                                                       src="@/assets/icons/gcash.B8fyM1U4.svg"
                                                                       role="img" width="38" height="24"
                                                                       class="_1tgdqw61 _1tgdqw60 _1fragemsx _1fragemss _1fragemt7 _1tgdqw66">
                                                                </div>

                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div id="basic-HitPay - QR Code, E-wallets and Cards-collapsible"
                                                           class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbd _94sxtb6 _1fragemst"
                                                           style="height: auto; overflow: visible;">
                                                        <div>
                                                          <div class="amyhxv1b amyhxv1d amyhxv1f">
                                                            <div
                                                              class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem41 _1fragem5u _1fragemos">
                                                              <div
                                                                class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z _1fragemos">
                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                     viewBox="-270.8 371 102 52" class="zjrzY">
                                                                  <path fill="none" stroke="currentColor"
                                                                        stroke-miterlimit="10" stroke-width="2"
                                                                        d="M-182 404v16.8c0 .7-.4 1.2-1 1.2h-75.7c-.7 0-1.2-.6-1.2-1.2v-47.6c0-.7.6-1.2 1.2-1.2h75.7c.7 0 1 .6 1 1.2V395m-78-14h78m-17 18h27m-3.9-4.6 4.5 4.6-4.5 4.6"></path>
                                                                  <circle cx="-255.5" cy="376.5" r="1.5"
                                                                          fill="currentColor"></circle>
                                                                  <circle cx="-250.5" cy="376.5" r="1.5"
                                                                          fill="currentColor"></circle>
                                                                  <circle cx="-245.5" cy="376.5" r="1.5"
                                                                          fill="currentColor"></circle>
                                                                </svg>
                                                                <div class="_1fragem1y _1fragemlo _16s97g73r"
                                                                     style="--_16s97g73m: 35rem;"><p
                                                                  class="_1tx8jg70 _1fragemlo _1tx8jg715 _1tx8jg71d _1tx8jg75 _1tx8jg72 _1fragemsk _1tx8jg71f">
                                                                  After clicking “Pay now”, you will be redirected to
                                                                  HitPay - QR Code, E-wallets and Cards to complete your
                                                                  purchase securely.</p></div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                          </div>
                                        </div>
                                      </section>
                                    </div>
                                  </section>
                                  <div class="_1fragem1y _1fragemlo gfFXW">
                                    <div class="_16s97g74v _16s97g760"></div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div>
                                  <div>
                                    <section
                                      class="_17kya4ui _17kya4ug _1fragemnl _17kya4up _17kya4uk _1fragemnh _1fragemtg _1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemf0 _1fragemg0 _1fragemh3 _1fragemht _1fragemd7 _1frageme7 _1fragemiw _1fragemjm _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                      style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                      <div class="_1fragem1y _1fragem35 _1fragemlo qReyn">
                                        <button type="button" aria-busy="false" lang=''
                                                class="_1s82kpb1 _1s82kpb0 _1fragemnv _1fragemlo _1fragemsm _1fragemsx _1fragemss _1fragemt7 _1fragemsg _1fragemto _1fragem1y _1fragemfz _1fragemhs _1fragemdh _1fragemjl _16s97g791 _16s97g73r _16s97g74b _16s97g741"
                                                style="--_16s97g73m: none; --_16s97g746: 0; --_16s97g73w: 0;">
                                          <div
                                            class="_1mrl40q0 _1fragemlo _1fragemmf _1fragemmm _1fragem2x _1fragem3w _1fragem5p _1fragemm3 _1fragem7s _1fragemou _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                            style="--_16s97g7a: 1fr; --_16s97g7k: minmax(0, 1fr); --_16s97g71e: minmax(0, 1fr) minmax(auto, max-content); --_16s97g71o: minmax(0, 1fr);">
                                            <h2 class="n8k95w1 n8k95w0 _1fragemlo n8k95w2 n8k95wg">Order summary</h2>
                                            <div class="WPQk2">
                                              <div
                                                class="_1mrl40q0 _1fragemlo _1fragemmf _1fragemmm _1fragem2x _1fragem3m _1fragem5f _1fragemm3 _16s97g7f _16s97g7p _16s97g71j _16s97g71t"
                                                style="--_16s97g7a: 1fr; --_16s97g7k: minmax(0, 1fr); --_16s97g71e: minmax(0, 1fr) minmax(auto, max-content); --_16s97g71o: minmax(0, 1fr);">
                                                <span
                                                  class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Show</span><span
                                                class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wup a8x1wuo a8x1wuw"><svg
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false"
                                                aria-hidden="true"
                                                class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                                stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 4.75 7.354 9.396a.5.5 0 0 1-.708 0L2 4.75"></path></svg></span>
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                        <div id="mobileOrderSummary" hidden=''
                                             class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbd _94sxtb6 _1fragemst"
                                             style="height: 0px;">
                                          <div></div>
                                        </div>
                                        <div>
                                          <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z">
                                            <section
                                              class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                              style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                              <div class="nfgb6p2 _1fragemsj"><h3 id="MoneyLine-Heading1"
                                                                                  class="n8k95w1 n8k95w0 _1fragemlo n8k95w4 n8k95wg">
                                                Cost summary</h3></div>
                                              <div role="table" aria-labelledby="MoneyLine-Heading1">
                                                <div role="rowgroup" class="nfgb6p2 _1fragemsj">
                                                  <div role="row">
                                                    <div role="columnheader">Item</div>
                                                    <div role="columnheader">Value</div>
                                                  </div>
                                                </div>
                                                <div role="rowgroup" class="nfgb6p1 nfgb6p0 _1fragem2x nfgb6p3">
                                                  <div role="row"
                                                       class="_1qy6ue60 _1qy6ue69 _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                                    <div role="rowheader" class="_1qy6ue6b"><span
                                                      class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Subtotal · {{ data.total_quantity
                                                      }} items</span>
                                                    </div>
                                                    <div role="cell" class="_1qy6ue6c"><span translate="no"
                                                                                             class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">${{ formatCurrency(data.total_goods_price)
                                                      }}</span>
                                                    </div>
                                                  </div>
                                                  <div role="row"
                                                       class="_1qy6ue60 _1qy6ue6a _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                                    <div role="rowheader" class="_1qy6ue6b">
                                                      <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                                        <div
                                                          class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmf _1fragemmm _1fragem3c _1fragem55 _1fragem7s">
                                                          <span class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Delivery</span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div role="cell" class="_1qy6ue6c"><span translate="no"
                                                                                             class="_19gi7yt0 _19gi7yt7 _19gi7yt12 _19gi7yt1b _19gi7yt1g notranslate">+ ${{ data.trans_free_toal
                                                      }}</span>
                                                    </div>
                                                  </div>
                                                  <div role="row"
                                                       class="_1x41w3p1 _1x41w3p0 _1fragem2x _1fragemmm _1x41w3p2">
                                                    <div role="rowheader" class="_1x41w3p6"><strong
                                                      class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l">Total</strong>
                                                    </div>
                                                    <div role="cell" class="_1x41w3p7">
                                                      <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                                        <div
                                                          class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemml _1fragem3h _1fragem5a _1fragem7s">
                                                          <abbr class="_1qifbzv1 _1qifbzv0 _1fragemsn"><span
                                                            translate="no"
                                                            class="_19gi7yt0 _19gi7yte _19gi7ytd _1fragemo6 _19gi7yt12 _19gi7yt1b _19gi7yt1g notranslate">SGD</span></abbr><strong
                                                          translate="no"
                                                          class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l notranslate">${{ formatCurrency(data.tot_price)
                                                          }}</strong>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>

                                                </div>
                                              </div>
                                            </section>
                                          </div>
                                        </div>
                                        <div class="_16s97g75p"></div>
                                      </div>
                                      <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4g _1fragem69">
                                        <div
                                          class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p"></div>
                                        <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z">
                                          <div>
                                            <div id="checkout-pay-button-section"
                                                 class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">
                                              <div>
                                                <button @click="goOrderfrom" class="_1m2hr9ge _1m2hr9gd _1fragemt8 _1fragemlo _1fragemnv _1fragemsm _1fragemt1 _1fragemt3 _1fragemss _1m2hr9g1p _1m2hr9g1l _1fragemnp _1m2hr9g1f _1m2hr9g1c _1fragemsr _1fragemsg _1m2hr9g1z _1m2hr9g1x _1m2hr9g16 _1m2hr9g13 _1m2hr9gh _1m2hr9gf _1fragem1y _1m2hr9g1w _1m2hr9g19 _1m2hr9g17 _1fragemoq _1m2hr9g1k">
                                                  <span
                                                    class="_1m2hr9gv _1m2hr9gu _1fragemsi _1fragemsx _1fragemsr _1fragemt4 _1m2hr9gr _1m2hr9gp _1fragem28 _1fragem73 _1fragemsk"><span
                                                    class="_19gi7yt0 _19gi7yti _19gi7yth _1fragemo8 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Pay now</span></span>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="_16s97g75k"></div>
                                      <div class="_197l2oft _1fragemny _1fragemmm _1fragem28 _1fragemlo"></div>
                                      <div class="_1fragem32 _1fragem20 _1fragemlo">
                                        <div class="_16s97g75f"></div>
                                      </div>
                                    </section>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="_197l2of1e _1fragemsj _1fragem1y _1fragemlo">
                            <button type="submit" tabindex="-1" aria-hidden="true">Submit</button>
                          </div>
                      </div>
                    </main>
                    <footer class="NGRNe GTe1e _1fragemnl">
                      <div class="QiTI2">
                        <div>
                          <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem41 _1fragem5u">
                            <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                              <div
                                class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmj _1fragemmq _1fragem3c _1fragem5p _1fragem7s">
                                <button type="button"
                                        class="_1m2hr9ge _1m2hr9gd _1fragemt8 _1fragemlo _1fragemnv _1fragemsm _1fragemt1 _1fragemt3 _1fragemss _1m2hr9g1h _1m2hr9g1e _1fragemt3 _1fragemt1 _1fragemsr _1fragemsg _1m2hr9gh _1m2hr9gf _1fragem1y _1m2hr9g1w _1m2hr9g1a _1m2hr9g18 _1fragemor _1m2hr9g1j _1m2hr9g1i _1fragemso"
                                        aria-haspopup="dialog"><span
                                  class="_1m2hr9gv _1m2hr9gu _1fragemsi _1fragemsx _1fragemsr _1fragemt4 _1m2hr9gr _1m2hr9gp _1fragem28 _1fragem73 _1fragemsk">Refund policy</span>
                                </button>
                                <button type="button"
                                        class="_1m2hr9ge _1m2hr9gd _1fragemt8 _1fragemlo _1fragemnv _1fragemsm _1fragemt1 _1fragemt3 _1fragemss _1m2hr9g1h _1m2hr9g1e _1fragemt3 _1fragemt1 _1fragemsr _1fragemsg _1m2hr9gh _1m2hr9gf _1fragem1y _1m2hr9g1w _1m2hr9g1a _1m2hr9g18 _1fragemor _1m2hr9g1j _1m2hr9g1i _1fragemso"
                                        aria-haspopup="dialog"><span
                                  class="_1m2hr9gv _1m2hr9gu _1fragemsi _1fragemsx _1fragemsr _1fragemt4 _1m2hr9gr _1m2hr9gp _1fragem28 _1fragem73 _1fragemsk">Privacy policy</span>
                                </button>
                                <button type="button"
                                        class="_1m2hr9ge _1m2hr9gd _1fragemt8 _1fragemlo _1fragemnv _1fragemsm _1fragemt1 _1fragemt3 _1fragemss _1m2hr9g1h _1m2hr9g1e _1fragemt3 _1fragemt1 _1fragemsr _1fragemsg _1m2hr9gh _1m2hr9gf _1fragem1y _1m2hr9g1w _1m2hr9g1a _1m2hr9g18 _1fragemor _1m2hr9g1j _1m2hr9g1i _1fragemso"
                                        aria-haspopup="dialog"><span
                                  class="_1m2hr9gv _1m2hr9gu _1fragemsi _1fragemsx _1fragemsr _1fragemt4 _1m2hr9gr _1m2hr9gp _1fragem28 _1fragem73 _1fragemsk">Terms of service</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </footer>
                  </div>
                </div>
                <div class="i4DWM _1fragemnl _1fragemni _1fragemtg">
                  <div class="_4QenE">
                    <aside>
                      <div>
                        <section
                          class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                          style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                          <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z"><h2
                            class="n8k95wh _1fragemsj">Order summary</h2>
                            <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem46 _1fragem5z">
                              <section
                                class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                                <div class="_1mjy8kn6 _1fragemlo _16s97g73k" style="--_16s97g73f: 40vh;">
                                  <div tabindex="0" role="group" scrollbehaviour="chain"
                                       class="_1mjy8kn1 _1mjy8kn0 _1fragemlo _1fragemoq _1fragem1t _1fragemel _1fragemhs _1fragemci _1fragemjl _16s97g73k _1mjy8kn4 _1mjy8kn2 _1fragemjq _1fragemk5"
                                       style="--_16s97g73f: 40vh;">
                                    <div class="_6zbcq522 _1fragemsj"><h3 id="ResourceList0"
                                                                          class="n8k95w1 n8k95w0 _1fragemlo n8k95w4 n8k95wg">
                                      Shopping cart</h3></div>
                                    <div role="table" aria-labelledby="ResourceList0"
                                         class="_6zbcq56 _6zbcq55 _1fragem28 _1fragemny _6zbcq5o _6zbcq5c _1fragem3w _6zbcq516">
                                      <div role="rowgroup"
                                           class="_6zbcq54 _6zbcq53 _1fragem28 _1fragemny _6zbcq51d _6zbcq51c _1fragemsj">
                                        <div role="row"
                                             class="_6zbcq51f _6zbcq51e _1fragem28 _1fragemmm _1fragemoq _1fragem5p">
                                          <div role="columnheader" class="_6zbcq522 _1fragemsj">Product image</div>
                                          <div role="columnheader" class="_6zbcq522 _1fragemsj">Description</div>
                                          <div role="columnheader" class="_6zbcq522 _1fragemsj">Quantity</div>
                                          <div role="columnheader" class="_6zbcq522 _1fragemsj">Price</div>
                                        </div>
                                      </div>
                                      <div v-for="(seller_goods) in data.seller_goodss " role="rowgroup"
                                           class="_6zbcq54 _6zbcq53 _1fragem28 _1fragemny">
                                        <div v-for="(item,index) in seller_goods.goods" role="row"
                                             class="_6zbcq51i _6zbcq51h _1fragem28 _1fragem1t _6zbcq51l _6zbcq510 _6zbcq51k">
                                          <div role="cell"
                                               class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51t _6zbcq51q _1fragem7s _6zbcq51o">
                                            <div class="_1fragem1y _1fragemlo _16s97g74b" style="--_16s97g746: 6.4rem;">
                                              <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7d">
                                                <div
                                                  class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmj _1fragemmq _1fragem3w _1fragem5p _1fragem7d">
                                                  <div
                                                    class="_1m6j2n34 _1m6j2n33 _1fragemlo _1fragemtk _1m6j2n3a _1m6j2n39 _1m6j2n35"
                                                    style="--_1m6j2n30: 1;">
                                                    <picture>
                                                      <el-image :src="item.image" fit="cover"
                                                                class="_1h3po425 _1h3po424 _1fragem1y _1fragemkk _1fragemka _1h3po426 _1fragemp2 _1fragemp0 _1fragemp4 _1fragemoy _1fragemq3 _1fragempz _1fragemq7 _1fragempv _1fragembe _1fragemau _1fragemby _1fragemaa _1fragemkz _1m6j2n3c _1fragemoq _1fragem1t _1m6j2n35" />

                                                    </picture>
                                                    <div class="_1m6j2n3m _1m6j2n3l _1fragemle">
                                                      <div
                                                        class="_99ss3s1 _99ss3s0 _1fragemmm _1fragem73 _1fragemor _99ss3s6 _99ss3s2 _1fragem28 _99ss3sh _99ss3sc _99ss3sa _1fragemi7 _1fragemge _99ss3su _99ss3sp _1fragempa _1fragempg _1fragemps _1fragempm">
                                                        <span
                                                          class="_99ss3sw _1fragemsj">Quantity</span><span>{{ item.quantity
                                                        }}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div role="cell"
                                               class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51p _6zbcq51n _1fragemms _6zbcq51x _6zbcq51w _1fragemo1 _16s97g741"
                                               style="--_16s97g73w: 6.4rem;">
                                            <div class="_1fragem1y _1fragemlo dDm6x"><p
                                              class="_1tx8jg70 _1fragemlo _1tx8jg7c _1tx8jg7b _1fragemo7 _1tx8jg715 _1tx8jg71d _1tx8jg71f">
                                              {{ item.name_en }}</p>
                                              <div
                                                class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem4v _1fragem6o">
                                                <p
                                                  class="_1tx8jg70 _1fragemlo _1tx8jg7a _1tx8jg79 _1fragemo6 _1tx8jg715 _1tx8jg71e _1tx8jg71f">
                                                  {{ item.subtitle_en }}</p></div>
                                            </div>
                                          </div>
                                          <div role="cell"
                                               class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51o _6zbcq51y">
                                            <div class="_6zbcq522 _1fragemsj"><span
                                              class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">1</span></div>
                                          </div>
                                          <div role="cell"
                                               class="_6zbcq521 _6zbcq520 _1fragem28 _1fragemny _6zbcq51u _6zbcq51r _1fragem73 _6zbcq51p _6zbcq51n _1fragemms">
                                            <div class="_197l2oft _1fragemny _1fragemmo _1fragem28 _1fragemlo Byb5s">
                                              <span translate="no"
                                                    class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">${{ formatCurrency(item.total)
                                                }}</span>
                                            </div>
                                          </div>
                                        </div>

                                      </div>
                                    </div>
                                  </div>
                                  <div aria-hidden="true"
                                       class="_1r4exbt7 _1r4exbt6 _1fragemeq _1fragemcx _1fragemim _1fragemgt _1fragemle _1fragem28 _1fragemmm _1fragemqk _1fragemsi _1r4exbta _1r4exbt8 _1fragemrk _1r4exbt5">
                                    Scroll for more items<span
                                    class="a8x1wu2 a8x1wu1 _1fragemoq _1fragem1t _1fragemkk _1fragemka a8x1wu9 a8x1wui a8x1wum a8x1wuk _1fragem1y a8x1wuq a8x1wuo a8x1wuw"><svg
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" focusable="false"
                                    aria-hidden="true"
                                    class="a8x1wuy a8x1wux _1fragem1y _1fragemoq _1fragemkk _1fragemka _1fragemnx"><path
                                    stroke-linecap="round" stroke-linejoin="round"
                                    d="M7 1.5v11m0 0 4.75-3.826M7 12.5 2.25 8.674"></path></svg></span></div>
                                </div>
                              </section>
                            </div>
                            <div id="gift-card-field"
                                 class="_94sxtb1 _94sxtb0 _1fragemjv _1fragemk5 _1fragemlo _1fragemt4 _94sxtbb _94sxtb4 _1fragemsr"
                                 style="height: auto; overflow: visible;">
                              <div>
                                <section
                                  class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                                  style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;"><h3
                                  id="checkout-main-header-reductions" tabindex="-1" class="n8k95wh _1fragemsj">Discount
                                  code or gift card</h3>
                                  <div class="_1ip0g651 _1ip0g650 _1fragemlo _1fragem2x _1fragem3w _1fragem5p">

                                  </div>
                                </section>
                              </div>
                            </div>
                            <section
                              class="_1fragemp6 _1fragempc _1fragempo _1fragempi _1fragem1y _1fragemfz _1fragemhs _1frageme6 _1fragemjl _1fragemlo _16s97g791 _16s97g73r _16s97g741 _16s97g74b"
                              style="--_16s97g73m: none; --_16s97g73w: 0; --_16s97g746: 0;">
                              <div class="nfgb6p2 _1fragemsj"><h3 id="MoneyLine-Heading0"
                                                                  class="n8k95w1 n8k95w0 _1fragemlo n8k95w4 n8k95wg">
                                Cost summary</h3></div>
                              <div role="table" aria-labelledby="MoneyLine-Heading0">
                                <div role="rowgroup" class="nfgb6p2 _1fragemsj">
                                  <div role="row">
                                    <div role="columnheader">Item</div>
                                    <div role="columnheader">Value</div>
                                  </div>
                                </div>
                                <div role="rowgroup" class="nfgb6p1 nfgb6p0 _1fragem2x nfgb6p3">
                                  <div role="row"
                                       class="_1qy6ue60 _1qy6ue69 _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                    <div role="rowheader" class="_1qy6ue6b"><span
                                      class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Subtotal · {{ data.total_quantity
                                      }} items</span>
                                    </div>
                                    <div role="cell" class="_1qy6ue6c"><span translate="no"
                                                                             class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g notranslate">${{ formatCurrency(data.total_goods_price)
                                      }}</span>
                                    </div>
                                  </div>
                                  <div role="row"
                                       class="_1qy6ue60 _1qy6ue6a _1qy6ue61 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                    <div role="rowheader" class="_1qy6ue6b">
                                      <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                        <div
                                          class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemmf _1fragemmm _1fragem3c _1fragem55 _1fragem7s">
                                          <span class="_19gi7yt0 _19gi7yt12 _19gi7yt1a _19gi7yt1g">Delivery</span></div>
                                      </div>
                                    </div>
                                    <div role="cell" class="_1qy6ue6c"><span translate="no"
                                                                             class="_19gi7yt0 _19gi7yt7 _19gi7yt12 _19gi7yt1b _19gi7yt1g notranslate">+ ${{ data.trans_free_toal
                                      }}</span>
                                    </div>
                                  </div>
                                  <div role="row" class="_1x41w3p1 _1x41w3p0 _1fragem2x _1fragemmm _1x41w3p2">
                                    <div role="rowheader" class="_1x41w3p6"><strong
                                      class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l">Total</strong>
                                    </div>
                                    <div role="cell" class="_1x41w3p7">
                                      <div class="_5uqybw0 _1fragemlo _1fragem28 _1fragem7s">
                                        <div
                                          class="_5uqybw1 _1fragem28 _1fragemkp _1fragemo4 _1fragemml _1fragem3h _1fragem5a _1fragem7s">
                                          <abbr class="_1qifbzv1 _1qifbzv0 _1fragemsn"><span translate="no"
                                                                                             class="_19gi7yt0 _19gi7yte _19gi7ytd _1fragemo6 _19gi7yt12 _19gi7yt1b _19gi7yt1g notranslate">SGD</span></abbr><strong
                                          translate="no"
                                          class="_19gi7yt0 _19gi7ytk _19gi7ytj _1fragemo9 _19gi7yt12 _19gi7yt1a _19gi7yt1l notranslate">${{ formatCurrency(data.tot_price)
                                          }}</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div role="row"
                                       class="_1qy6ue60 _1qy6ue69 _1qy6ue64 _1qy6ue67 _1qy6ue65 _1fragem3h _1fragem5a _1fragem2x">
                                    <div role="rowheader" class="_1qy6ue6b">
                                      <p class="_1tx8jg70 _1fragemlo _1tx8jg715 _1tx8jg71e _1tx8jg71f">
                                      <span class="go06b0">
                                        <span></span>
                                      </span>
                                      </p>
                                    </div>
                                    <div role="cell" class="_1qy6ue6c"></div>
                                  </div>
                                </div>
                              </div>
                            </section>
                          </div>
                        </section>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" class="_1fragemsz _1fragemt7 _1fragemsv" style="opacity: 0;">
            <div class="_1fragemlj _1fragemqe _1fragemrn _1fragemr8">
              <progress max="1" aria-label="Processing…"
                        class="xvcb04 xvcb03 _1fragem9b _1fragem8r _1fragem9v _1fragem87 _1fragemlo _1fragemoq _1fragem5 _1fragem1y xvcb05"></progress>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div id="forwarding-external-new-window-message" aria-hidden="true" class="rij0560 _1fragemsj">Opens external
      website in a new window.
    </div>
    <div class="rij0560 _1fragemsj" id="forwarding-new-window-message" aria-hidden="true">Opens in a new window.</div>
    <!--SSR APP RENDER SUCCESS-->
    <div id="forwarding-external-message" aria-hidden="true" class="rij0560 _1fragemsj">Opens external website.</div>
    <div role="status" class="_14u2r6s0 _1fragemsj"></div>
    <div role="alert" class="_14u2r6s0 _1fragemsj"></div>
  </div>
</template>

<style>
@import url(@/styles/placeOrder.css);
@import url(@/styles/deliverymethodselectorsection.css);

.vertical-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐按钮 */
  gap: 10px; /* 按钮之间的间距 */
}

/* 可选：移除按钮的边框圆角（如果需要保持一致外观） */
.vertical-radio-group .el-radio-button__inner {
  border-radius: 4px !important;
}
</style>
