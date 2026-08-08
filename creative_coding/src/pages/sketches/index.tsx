import Head from "next/head";
import Navbar, { sketches } from "@/components/navbar";

export default function SketchesIndex() {
  return (
    <>
      <Head>
        <title>Sketches</title>
      </Head>
      <Navbar />
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "13px",
          color: "#555",
        }}
      >
        {sketches.length} sketches. Pick a number.
      </main>
    </>
  );
}
