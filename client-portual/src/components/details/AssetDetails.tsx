import "../../App.css";
import "./AssetDetails.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";

import useAlert from "../../hooks/alert/useAlert";
import useConfirmation from "../../hooks/confirmation/useConfirmation";
import useSasToken from "../../hooks/sastoken/useSasToken";
import { useUser } from "../../hooks/user/useUser";
import AssetService from "../../services/asset/AssetService";
import SearchService from "../../services/search/SearchService";
import { AlertType } from "../../store/contexts/alert/AlertContext";
import { ElementType } from "../../store/contexts/confirmation/ConfirmationContext";
import type { Asset, Tag } from "../../types";
import AssetPreviewDisplay from "../3d-previewer/AssetPreviewDisplay";
import Confirmation from "../confirmation/Confirmation";
import DownloadAssetButton from "./DownloadAssetButton";

/**
 * The asset details component.
 */
export default function AssetDetails() {
  const [is3DPreviewActive, setIs3DPreviewActive] = useState(false);
  const { user } = useUser();
  const { assetSasToken, fetchAssetSasToken } = useSasToken();
  const [asset, setAsset] = useState<Asset>();
  const assetId = window.location.pathname.split("/").pop();
  // current preview image index
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const { addAlert } = useAlert();
  const { setConfirmationDetails } = useConfirmation();
  const isDisabled = !asset || asset?.format === "image/png";

  /**
   * Function to trigger a new asset sastoken retrieval.
   */
  const getAssetToken = async () => {
    if (fetchAssetSasToken) {
      await fetchAssetSasToken();
    }
  };

  useEffect(() => {
    getAssetToken().catch((error: unknown) => {
      console.error("Error fetching asset sas token:", error);
    });
  }, []);

  /**
   * Function to get the selected asset by ID.
   * @param id The asset ID to get.
   */
  const getSelectedAsset = async (id: string) => {
    // Call the search service to get the asset by ID
    setAsset(await SearchService.byId({ id }));
  };

  // Fetch the asset data
  useEffect(() => {
    if (assetId) {
      getSelectedAsset(assetId).catch((error: unknown) => {
        console.error("Error fetching asset:", error);
      });
    }
  }, [assetId]);

  useEffect(() => {
    setCurrentPreviewIndex(0);
  }, [asset]);

  /**
   * Function to handle the deletion of the asset.
   */
  const handleDelete = async () => {
    if (asset) {
      const response = await AssetService.deleteAsset({ id: assetId! });
      if (response.success) {
        addAlert!({
          alertMessage: response.message,
          alertType: AlertType.Success
        });
        setTimeout(() => {
          window.location.href = "/asset";
        }, 1000);
      } else {
        addAlert!({
          alertMessage: response.message,
          alertType: AlertType.Error
        });
      }
    }
  };

  return (
    <>
      <Confirmation onConfirm={() => void handleDelete()} />

      <div className="px-5 lg:flex lg:size-full">
        <div className="size-full pt-10 lg:py-10" id="previews">
          {is3DPreviewActive ? (
            <div className="size-full">
              <AssetPreviewDisplay asset={asset} />
            </div>
          ) : (
            <div className="flex size-full items-center justify-center">
              {asset ? (
                <Carousel
                  dynamicHeight={false}
                  infiniteLoop={true}
                  onChange={index => {
                    setCurrentPreviewIndex(index);
                  }}
                  selectedItem={currentPreviewIndex}
                  showStatus={false}
                  showThumbs={false}>
                  {asset && asset?.previews!.length > 0
                    ? asset.previews?.map(image => (
                        <img
                          alt="Not Found"
                          className="mb-20 aspect-video h-full rounded-lg object-scale-down"
                          draggable="false"
                          key={`image-${assetId ?? ""}`}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              "/assets/NotFoundPreview.webp";
                          }}
                          src={`${image}?${assetSasToken}`}
                        />
                      ))
                    : [
                        <img
                          alt="Preview Not Available"
                          className="mb-20 aspect-video h-full rounded-lg object-scale-down"
                          draggable="false"
                          key="fallback"
                          src="/assets/NotFoundPreview.webp"
                        />
                      ]}
                </Carousel>
              ) : null}
            </div>
          )}
        </div>
        <div
          className="size-full lg:ml-4 lg:min-w-[325px] lg:max-w-[30vw] lg:pb-5 lg:pt-10"
          id="infoPanel">
          <div id="InfoPanelHeader">
            <span className="text-2xl font-medium">{asset?.name}</span>
          </div>

          <div
            className="mt-3 flex w-full flex-row justify-between space-x-4"
            id="Buttons">
            <DownloadAssetButton
              assetFileName={asset?.name}
              assetId={assetId!}
            />

            <button
              className={`w-full rounded-lg px-5 py-2 text-sm font-medium ${
                isDisabled
                  ? "cursor-not-allowed bg-general-20 text-gray-600"
                  : "bg-yellow-80 text-general-10 hover:bg-yellow-70 focus:ring-2 focus:ring-general-10"
              }`}
              disabled={isDisabled}
              onClick={() => {
                setIs3DPreviewActive(prevState => {
                  return !prevState;
                });
              }}
              type="button">
              {is3DPreviewActive ? "Close 3D View" : "View in 3D"}
            </button>
          </div>

          <table className="mt-5 w-full border-separate border-spacing-0 text-nowrap rounded-lg border-2 border-general-10 text-left text-sm">
            <tbody>
              <tr>
                <td className="pt-1" />
              </tr>

              <tr>
                <th className="text-left">Format</th>

                <td className="text-right">
                  <span>{asset?.format}</span>
                </td>
              </tr>

              {asset?.model?.triCount &&
              asset?.model?.vertices &&
              asset?.model?.polygons ? (
                <tr>
                  <th className="align-text-top">Geometry</th>

                  <td className="text-right">
                    Triangles: <span>{asset?.model?.triCount ?? 0}</span>
                    <br />
                    Vertices: <span>{asset?.model?.vertices ?? 0}</span>
                    <br />
                    Polygons: <span>{asset?.model?.polygons ?? 0}</span>
                    <br />
                  </td>
                </tr>
              ) : null}
              {asset?.model?.rigType ? (
                <tr>
                  <th className="text-left">Rigged Geometries</th>

                  <td className="text-right">
                    Rig Type: <span>{asset?.model?.rigType}</span>
                  </td>
                </tr>
              ) : null}

              <tr>
                <th className="text-left">Date Uploaded</th>

                <td className="text-right">
                  <span>
                    {asset?.createdAt
                      ? new Date(asset.createdAt).toLocaleDateString()
                      : "--"}
                  </span>
                </td>
              </tr>

              <tr>
                <th className="text-left">Size</th>

                <td className="text-right">
                  <span>
                    {asset?.fileSize
                      ? asset.fileSize >= 1024 * 1024 * 1024
                        ? `${(asset.fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`
                        : `${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : "--"}
                  </span>
                </td>
              </tr>

              <tr>
                <td className="pb-1" />
              </tr>
            </tbody>
          </table>

          <p className="tablet:text-[1rem] mt-4 text-left text-[0.8rem] font-semibold">
            Tags:{" "}
            <span className="text-general-50">
              {asset?.tags?.map((tag: Tag) => tag.name).join(", ")}
              {asset?.tags?.length === 0 && <span>&nbsp; --none--</span>}
            </span>
          </p>

          <div className="flex w-full py-4">
            {/*Delete button is only visible for admin roles*/}
            {user?.role === "admin" && (
              <button
                className="hover w-full rounded-lg bg-red-40 px-5 py-2 text-center text-sm font-medium text-general-10 hover:bg-red-90 focus:ring-2 focus:ring-general-10"
                onClick={() => {
                  setConfirmationDetails!({
                    elementId: assetId!,
                    elementName: asset?.name,
                    elementType: ElementType.asset
                  });
                }}
                type="button">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
