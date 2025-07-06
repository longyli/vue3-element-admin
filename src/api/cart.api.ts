import request from "@/utils/request";
import { LoginFormData, LoginResult } from "@/api/auth.api";
import { getAccessToken } from "@/utils/auth";


const CartAPI = {
  /** 添加到购物车*/
  add(data) {
    return request({
      url: `wxapp.php?controller=car.add`,
      method: "POST",
      params: {
        'token':data.token,
        "goods_id": data.goods_id,
        "community_id": data.community_id,
        "quantity": data.quantity,
        "sku_str": '',
        "buy_type": 'dan',
        "pin_id": '0',
        "is_just_addcar": '1'
      }

    });
  },
  reduceCarGoods(data) {
    return request({
      url: `wxapp.php?controller=car.reduce_car_goods`,
      method: "POST",
      params: {
        'token':data.token,
        "goods_id": data.goods_id,
        "community_id": data.community_id,
        "quantity": data.quantity,
        "sku_str": '',
        "buy_type": 'dan',
        "pin_id": '0',
        "is_just_addcar": '1'
      }

    });
  },

  getCartNum(token,community_id){

    return request({
      url: `wxapp.php?controller=car.count`,
      method: "get",
      params: {token,community_id}
    });
  },
  getExpressDateList(head_id){

    return request({
      url: `wxapp.php?controller=car.get_express_date_list`,
      method: "get",
      params: {'head_id':head_id}
    });
  },
  showCartGoods(token,community_id){
    return request({
      url: `wxapp.php?controller=car.show_cart_goods`,
      method: "get",
      params: {
        'token':token,
        'community_id':community_id,
        'buy_type':'dan'
      }
    });
  },
  checkout(token,community_id){
    return request({
      url: `wxapp.php?controller=car.checkout`,
      method: "get",
      params: {
        'token':token,
        'community_id':community_id,
        'buy_type':'dan'
      }
    });
  },

  //删除购物车商品
  del_car_goods(token,community_id,carkey){
    return request({
      url: `wxapp.php?controller=car.del_car_goods`,
      method: "get",
      params: {
        'token':token,
        'community_id':community_id,
        'carkey':carkey
      }
    });
  },


  /**
   * 修改购物车商品数量
   * controller: car.checkout_flushall
   * token: 80ef32d8c5e756da8c2f2ca4e7e65d7e
   * car_key: cart.18927:147::
   * community_id: 147
   * all_keys_arr: cart.18927:147::_5
   * cur_car_key: cart.18927:147::
   * @param token
   * @param community_id
   * @param car_key
   * @param all_keys_arr
   * @param cur_car_key
   */
  checkout_flushall(token,community_id,car_key,all_keys_arr,cur_car_key){
    return request({
      url: `wxapp.php?controller=car.checkout_flushall`,
      method: "get",
      params: {
        'token':token,
        'community_id':community_id,
        'car_key':car_key,
        'all_keys_arr':all_keys_arr,
        'cur_car_key':cur_car_key
      }
    });
  }

};

export default CartAPI;

