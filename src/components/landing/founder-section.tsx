'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AnimatedSection } from './animations';

// ===========================================
// PIXLY - Founder Section
// Minimal centered design with dark background
// ===========================================

interface FounderSectionProps {
  name?: string;
  role?: string;
  imageSrc?: string;
  quote?: string;
}

export function FounderSection({
  name = 'Emilien Nepveu',
  role = 'Fondateur & CEO',
  imageSrc = '/CEO.png',
  quote = 'Pixly n\'est pas simplement un outil de tracking, c\'est la fin des décisions marketing à l\'aveugle. Nous donnons aux annonceurs la clarté qu\'ils méritent pour scaler sereinement.',
}: FounderSectionProps) {
  return (
    <section className="relative py-24 sm:py-32 bg-neutral-900 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800/50 to-neutral-900" />

      <div className="relative mx-auto max-w-4xl px-6 sm:px-8">
        <AnimatedSection>
          <div className="text-center">
            {/* Quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-snug sm:leading-snug"
            >
              "{quote}"
            </motion.blockquote>

            {/* Name & Role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <p className="text-lg font-medium text-white">{name}</p>
              <p className="mt-1 text-sm text-neutral-400">{role}</p>
            </motion.div>

            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="mt-8 flex justify-center"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800">
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
