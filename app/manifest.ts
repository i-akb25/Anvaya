import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest {
return {name:"Anvaya | Preparation workspace",short_name:"Anvaya",description:"Connected learning, grounded preparation.",start_url:"/",display:"standalone",background_color:"#f5f3ef",theme_color:"#9a532f",icons:[{src:"/brand/icon-192.png",sizes:"192x192",type:"image/png"},{src:"/brand/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"}]};
}
