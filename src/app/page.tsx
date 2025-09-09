import { createStrictClassSelector } from "@/lib/class-selectors";
import utilitiesCss from "@/styles/utilities.module.css";
import { clsx } from "clsx";
import styles from "./page.module.css";

const css = createStrictClassSelector(styles);
const cssUtils = createStrictClassSelector(utilitiesCss);

export default function Home() {
	return <div className={clsx(css("container"), cssUtils("fixed", `block`))}>Hello world</div>;
}
