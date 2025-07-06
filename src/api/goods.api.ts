import request from "@/utils/request";


const GoodsAPI = {

  /** 登录接口*/
  get_category_list(is_type_show: string) {
    return request({
      url: `wxapp.php?controller=goods.get_category_list`,
      method: "get",
      params: {
        'is_type_show':is_type_show
      }
    });
  },
  get_goods_detail(params) {
    return request({
      url: `wxapp.php?controller=goods.get_goods_detail`,
      method: "get",
      params
    });
  },
  load_cate_goodslist(params) {
    return request({
      url: `wxapp.php?controller=index.load_cate_goodslist`,
      method: "get",
      params
    });
  },

  goods_guess_like(params){
    return request({
      url: `wxapp.php?controller=goods.goods_guess_like`,
      method: "get",
      params
    });
  }
};

export default GoodsAPI;
