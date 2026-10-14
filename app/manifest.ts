import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest {
return {name:"Anvaya | Preparation workspace",short_name:"Anvaya",description:"Connected learning, grounded preparation.",start_url:"/",display:"standalone",background_color:"#f8f5ed",theme_color:"#446856",icons:[{src:"/brand/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/brand/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"}]};
}
