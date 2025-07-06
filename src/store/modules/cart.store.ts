import CartAPI, { type CommunityInfo } from "@/api/cart.api";
import { getAccessToken } from "@/utils/auth";
export const useCartStore = defineStore("cart", () => {
  const cartNum = useStorage("cartNum", 0);
  function addCart(data) {

    return new Promise<void>((resolve, reject) => {
      CartAPI.add(data).then((res)=>{
          if(res.code = 1){
            cartNum.value = res.total;
            resolve(res);
          }else{
            reject(false);
          }
      }).catch((er)=>{
        reject(er);
      })
    });
  }

  function reduceCarGoods(data) {

    return new Promise<void>((resolve, reject) => {
      CartAPI.reduceCarGoods(data).then((res)=>{
        if(res.code = 1){
          cartNum.value = res.total || 0;
          resolve(res);
        }else{
          reject(false);
        }
      }).catch((er)=>{
        reject(er);
      })
    });
  }

  function getCartNum(community_id) {

    return new Promise<void>((resolve, reject) => {
      const token = getAccessToken();

      CartAPI.getCartNum(token,community_id).then((res)=>{
        if(res.code == 0){
          cartNum.value = res.data;
        }else{
          cartNum.value = 0;
        }
      }).catch((error)=>{
        cartNum.value = 0;
      })
    });
  }

  return {
    cartNum,
    getCartNum,
    addCart
  };
});
