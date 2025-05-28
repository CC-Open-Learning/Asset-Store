import { useEffect, useState } from "react";
import { Color } from "three";

import NotFound3D from "../../components/3d/notfound3d/NotFound3D";
import Header from "../../components/header/Header";
import UtilService from "../../services/util/UtilService";

/**
 * Main NotFoundPage component that renders the custom 404 page.
 */
const NotFoundPage = () => {
  const modelColor = "text-red-40";

  const [modelColorHex, setModelColorHex] = useState<null | string>(null);

  useEffect(() => {
    setModelColorHex(UtilService.getColorFromHTMLElement(modelColor));
  }, [modelColor]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex h-[calc(100vh-56px)] flex-col items-center justify-center">
        <div className={`hidden ${modelColor}`} />
        <div className="flex h-full w-3/4 flex-col items-center justify-center">
          {modelColorHex ? (
            <NotFound3D color={new Color(modelColorHex)} />
          ) : null}
          <div className="mt-1 text-center">
            <h1 className="mb-2 text-2xl font-bold text-general-40">
              Ooops! Something went wrong.
            </h1>
            <p className="mb-5 text-lg text-yellow-80">
              We can&apos;t find the page you are looking for
            </p>
            <button
              className="cursor-pointer rounded bg-yellow-80 px-5 py-2 text-base text-general-10"
              onClick={() => (window.location.href = "/")}
              type="submit">
              Home page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
