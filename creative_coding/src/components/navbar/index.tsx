import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./styles.module.scss";

// One flat run: the label is the position in this list, the route keeps the
// component name. Order is pages 1-6, then drawings 7-17.
export const sketches = [
  "page1",
  "page2",
  "page3",
  "page4",
  "page5",
  "page6",
  "drawing1",
  "drawing2",
  "drawing3",
  "drawing4",
  "drawing5",
  "drawing6",
  "drawing7",
  "drawing8",
  "drawing9",
  "drawing10",
  "drawing11",
];

export default function Navbar() {
  const { pathname } = useRouter();

  return (
    <nav
      className={styles.nav}
      // drawing5-7 toggle their audio on any mousedown that reaches the window,
      // so clicking a link would start the track on the way out. Stop it here.
      onMouseDown={(e) => e.stopPropagation()}
    >
      {sketches.map((name, i) => {
        const href = `/sketches/${name}`;
        const isActive = pathname === href;

        return (
          <Link
            key={name}
            href={href}
            title={name}
            className={isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            {i + 1}
          </Link>
        );
      })}
    </nav>
  );
}
