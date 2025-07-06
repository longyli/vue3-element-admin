import request from "@/utils/request";
import { LoginResult } from "@/api/auth.api";
import { getAccessToken } from "@/utils/auth";

const CommunityAPI = {

  get_community_info(community_id) {
    return request({
      url: `wxapp.php?controller=index.get_community_info`,
      method: "get",
      params: {
        'token':getAccessToken(),
        community_id
      },
    });
  },
  addhistory_community(params) {
    return request({
      url: `wxapp.php?controller=index.addhistory_community`,
      method: "get",
      params
    });
  },
  load_history_community() {
    return request({
      url: `wxapp.php?controller=index.load_history_community`,
      method: "get",
      params: {
        'token':getAccessToken(),
      }
    });
  },

  getGroupInfo() {
    return request({
      url: `wxapp.php?controller=index.get_group_info`,
      method: "get"
    });
  },

};


export default CommunityAPI;



export interface CommunityInfo {
  communityId: number;
  communityName: string;
  memberId: number;
  fullAddress: string;
  communityAddress: string;
  headImg: string;
  disUserHeadImg: string;
  disUserName: string;
  headMobile: string;
  lon: string;
  lat: string;
  wechat: string;
  shareWxcode: string;
}
