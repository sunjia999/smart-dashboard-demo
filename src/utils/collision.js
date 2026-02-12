// 检测碰撞
export const checkCollision = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};
export const hasCollision = (components, x, y, width, height, excludeId) => {
  const rect = { x, y, width, height };
  return components.some((comp) => {
    if (comp.id === excludeId) return false;
    const compRect = {
      x: comp.position.x,
      y: comp.position.y,
      width: comp.size.width,
      height: comp.size.height,
    };
    return checkCollision(rect, compRect);
  });
};

// 查找非重叠
export const findNonOverlapPosition = (
  components,
  newRect,
  maxAttempts = 100,
) => {
  let x = newRect.x;
  let y = newRect.y;
  let attempts = 0;
  const step = 20;

  while (attempts < maxAttempts) {
    let hasCollision = false;

    // 检查是否与现有组件重叠
    for (const component of components) {
      const rect = {
        x: component.position.x,
        y: component.position.y,
        width: component.size.width,
        height: component.size.height,
      };

      const newPositionRect = {
        x,
        y,
        width: newRect.width,
        height: newRect.height,
      };

      if (checkCollision(newPositionRect, rect)) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      return { x, y };
    }

    // 尝试新位置
    attempts++;
    y += step;

    // 如果超出画布高度，换到下一列
    if (y + newRect.height > 800) {
      y = 0;
      x += step;
    }
  }

  // 如果找不到不重叠的位置，返回原始位置
  return { x: newRect.x, y: newRect.y };
};
