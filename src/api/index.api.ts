import request from "@/utils/request";
const IndexAPI = {

  /** 登录接口*/
  get_web_menu_list() {
    return request({
      url: `wxapp.php?controller=index.get_web_menu_list`,
      method: "get"
    });
  },

  index_info(params) {

    return request({
      url: `wxapp.php?controller=index.index_info`,
      method: "get",
      params
    });
  },

  get_navigat(){
    return request({
      url: `wxapp.php?controller=index.get_navigat`,
      method: "get",
    });
  },

  load_index_goodslist(params){
    return request({
      url: `wxapp.php?controller=index.load_all_goodslist`,
      method: "get",
      params
    });
  }

};


export default IndexAPI;

