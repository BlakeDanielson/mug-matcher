"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "mx-auto w-full bg-indigo-800 relative rounded-2xl overflow-hidden",
        containerClassName
      )}
      initial={{ y: 0 }}
      whileHover={{
        y: -5,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className={cn("relative h-full", className)}
        whileHover={{
          rotateX: 2,
          rotateY: 2,
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:mx-0 sm:rounded-2xl overflow-hidden">
          <motion.div
            className="h-full px-4 py-20 sm:px-10"
            whileHover={{
              scale: 1.02,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 