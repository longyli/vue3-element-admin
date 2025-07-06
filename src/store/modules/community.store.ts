import { store, useAppStore } from "@/store";
import CommunityAPI, { type CommunityInfo } from "@/api/community.api.ts";
import { getAccessToken } from "@/utils/auth";
import { useRoute } from "vue-router";
import router from "@/router";
const route = useRoute();
export const useCommunityStore = defineStore("community", () => {
  const communityInfo = useStorage<CommunityInfo>("communityInfo", {} as CommunityInfo);

  function getHistoryCommunity() {
    return new Promise((resolve, reject) => {
      CommunityAPI.get_community_info(community_id)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  function addhistory(community,isNew = false) {
    const token = getAccessToken();
    const community_id = community.communityId
    return new Promise((resolve, reject) => {
      CommunityAPI.addhistory_community({
        'token':token,
        community_id,
      })
        .then((data) => {
          if (isNew) {
            console.log('新人 社区')
            CommunityAPI.get_community_info(community_id).then((result) =>{
              if (result.code == 0) {
                let community = result.data;
                changeCommunity(community)
              }
            })
          }
        })
        .catch((error) => {

        });
    });
  }

  function getCommunityById(community_id){
    return new Promise((resolve, reject) => {
      CommunityAPI.get_community_info(community_id)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function getHistoryCommunity() {
    return new Promise((resolve, reject) => {
      CommunityAPI.load_history_community()
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function getCommunityInfo(){
    return new Promise((resolve, reject) => {
      CommunityAPI.load_history_community()
        .then((res) => {
          if (res.code == 0) {
            let history_communities = res.list;
            if (Object.keys(history_communities).length > 0 || history_communities.communityId != 0){
              changeCommunity(history_communities)
              resolve(history_communities);
            } else {
              resolve('');
            }
          } else if (res.code == 1){
            console.log(param)
            if (getAccessToken() && param.communityId === void 0){
              router.replace('/ulink_comshop/pages/position/community')
              resolve('');
            } else {
              resolve(param);
            }
          } else {
            // 未登录
            resolve('');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function check_login() {
    let token = getAccessToken();
    let member_id = wx.getStorageSync('member_id');

    if (token && member_id != undefined && member_id.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  function changeCommunity(community: CommunityInfo) {
    communityInfo.value = community;
  }

  function setGroupInfo() {
    return new Promise(function (resolve, reject) {
      // let groupInfo = wcache.get('groupInfo', 1);
      // if (groupInfo == 1) {

      CommunityAPI.getGroupInfo().then((res)=>{
        if (res.code == 0) {
          let obj = res.data;
          console.log(obj);
          obj.commiss_diy_name = obj.commiss_diy_name || '分销';
          obj.group_name = obj.group_name || '社区';
          obj.owner_name = obj.owner_name || '团长';
          obj.delivery_ziti_name = obj.delivery_ziti_name || '到点自提';
          obj.delivery_tuanzshipping_name = obj.delivery_tuanzshipping_name || '团长配送';
          obj.delivery_express_name = obj.delivery_express_name || '快递配送';
          obj.placeorder_tuan_name = obj.placeorder_tuan_name;
          obj.placeorder_trans_name = obj.placeorder_trans_name;
          obj.localtown_modifypickingname = obj.localtown_modifypickingname
          resolve(obj);
        }
      })

    })
  }
  
  return {
    communityInfo,
    getHistoryCommunity,
    getCommunityById,
    addhistory,
    changeCommunity,
    getCommunityInfo
  };

})
export function useCommunityStoreHook() {
  return useAppStore(store);
}
