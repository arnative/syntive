import { pointerWithin, closestCenter, type CollisionDetection } from '@dnd-kit/core';

// Pointer-within first, closest-center fallback — the collision strategy used
// by both the widget grid and the bookmark folder grid.
export const pointerThenCenter: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
};

// Drag overlay settle animation shared by the widget & bookmark drag overlays.
export const DROP_ANIMATION = { duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' } as const;
