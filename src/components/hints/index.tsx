import { useRouter } from "next/router";
import { audioSketches } from "@/components/navbar";
import styles from "./styles.module.scss";

// Rendered once from _app, so every sketch route gets the hints without each
// component having to repeat them. The sketch listing has no canvas, so it is
// the one route that opts out.
export default function Hints() {
  const { pathname } = useRouter();

  if (pathname === "/sketches") return null;

  const name = pathname.startsWith("/sketches/")
    ? pathname.slice("/sketches/".length)
    : null;

  return (
    <>
      <p className={styles.refreshHint}>
        Click <span className={styles.key}>⟳</span> to restart the animation
      </p>

      {name !== null && audioSketches.includes(name) && (
        <p className={styles.audioHint}>
          Click anywhere on the screen to start the animation
        </p>
      )}
    </>
  );
}
