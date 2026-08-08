import Head from "next/head";
import Navbar from "@/components/navbar";
import Page1 from "@/components/page1";

export default function Sketch1() {
  return (
    <>
      <Head>
        <title>Sketch 1 — page1</title>
      </Head>
      <Navbar />
      <Page1 />
    </>
  );
}
