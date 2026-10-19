import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};
