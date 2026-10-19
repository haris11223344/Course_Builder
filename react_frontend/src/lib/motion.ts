import { Transition } from "framer-motion";

export const spring = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 0.8,
} satisfies Transition;

export const springSnappy = {
  type: "spring",
  stiffness: 450,
  damping: 28,
} satisfies Transition;

export const springGentle = {
  type: "spring",
  stiffness: 200,
  damping: 25,
} satisfies Transition;

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: spring,
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};
