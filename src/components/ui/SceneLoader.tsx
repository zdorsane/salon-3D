import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader } from './Loader';

interface SceneLoaderProps {
  /** La pièce est affichée */
  ready: boolean;
}

/** Écran de chargement du showroom : progression des fichiers 3D, fondu à la fin. */
export function SceneLoader({ ready }: SceneLoaderProps) {
  const { active, progress } = useProgress();
  const visible = !ready;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="scene-loader" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}>
          <Loader {...(active ? { progress } : {})} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
