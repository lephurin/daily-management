"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  layoutId?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  layoutId,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
