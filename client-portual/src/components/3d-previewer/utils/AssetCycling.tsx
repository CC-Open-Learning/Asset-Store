const STEP_FORWARD = 1;
const STEP_BACKWARD = -1;

/**
 * Advances to the next asset in the asset list if the
 * current asset is not the last one. If the current
 * asset is the last asset, it wraps around to the first
 * asset in the list.
 * @param currentAssetIndex The index of the current asset being displayed.
 * @param setCurrentAssetIndex Function to set the current asset index.
 * @param assetList The list of assets.
 */
export function nextAsset(
  currentAssetIndex: number,
  setCurrentAssetIndex: (index: number) => void,
  assetList: unknown[]
) {
  setCurrentAssetIndex((currentAssetIndex + STEP_FORWARD) % assetList.length);
}

/**
 * Goes to the previous asset in the asset list if the
 * current asset is not the first asset. If the current
 * asset is the first asset, it goes to the last asset
 * in the list.
 * @param currentAssetIndex The index of the current asset being displayed.
 * @param setCurrentAssetIndex Function to set the current asset index.
 * @param assetList The list of assets.
 */
export function prevAsset(
  currentAssetIndex: number,
  setCurrentAssetIndex: (index: number) => void,
  assetList: unknown[]
) {
  setCurrentAssetIndex(
    (currentAssetIndex + STEP_BACKWARD + assetList.length) % assetList.length
  );
}
