'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FounderSectionProps {
  name?: string;
  role?: string;
  imageSrc?: string;
  quote?: string;
}

export function FounderSection({
  name = 'Emilien Nepveu',
  role = 'Fondateur & CEO de Pixly',
  imageSrc = '/CEO.png',
  quote = "Pixly n'est pas simplement un outil de tracking, c'est la fin des décisions marketing à l'aveugle. Nous donnons aux annonceurs la clarté qu'ils méritent pour scaler sereinement.",
}: FounderSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe wrapper
  const MotionDiv = mounted ? motion.div : 'div';

  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50 overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Content - centered testimonial style */}
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Quote */}
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-snug sm:leading-snug lg:leading-snug">
              "{quote}"
            </blockquote>

            {/* Name */}
            <p className="mt-10 text-lg font-semibold text-neutral-900">
              {name}
            </p>

            {/* Role */}
            <p className="mt-1 text-sm text-neutral-500 font-mono tracking-wide">
              {role}
            </p>

            {/* Avatar */}
            <div className="mt-8 flex justify-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            {/* Quote */}
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-900 leading-snug sm:leading-snug lg:leading-snug">
              "{quote}"
            </blockquote>

            {/* Name */}
            <p className="mt-10 text-lg font-semibold text-neutral-900">
              {name}
            </p>

            {/* Role */}
            <p className="mt-1 text-sm text-neutral-500 font-mono tracking-wide">
              {role}
            </p>

            {/* Avatar */}
            <div className="mt-8 flex justify-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white shadow-lg">
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
