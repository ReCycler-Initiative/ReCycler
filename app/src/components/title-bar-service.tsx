"use client";

import TitleBar from "./title-bar";

const TitleBarService = () => {
  return <TitleBar logo={<p className="font-bold ml-2">Kokonaispalvelun nimi</p>} toHomeHref="/" />;
};

export default TitleBarService;