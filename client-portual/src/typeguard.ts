import { Asset, Production, Model, Texture } from "./types";

export function hasProduction(
  asset: Asset
): asset is Asset & { production: Production } {
  return asset.production !== undefined;
}

export function hasModel(asset: Asset): asset is Asset & { model: Model } {
  return asset.model !== undefined;
}

export function hasTexture(
  asset: Asset
): asset is Asset & { texture: Texture } {
  return asset.texture !== undefined;
}
