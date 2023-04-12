import React from 'react';
import { useGui } from 'react-dat-gui';

const Gui = ({ values, onChange }) => {
  const gui = useGui();

  React.useEffect(() => {
    const folder = gui.addFolder('My Controls');
    folder.add(values, 'rotationSpeed', 0, 1).step(0.01).onChange(onChange);
    folder.add(values, 'cameraPositionZ', 0, 10).step(0.1).onChange(onChange);
    folder.open();
  }, [gui]);

  return null;
};

export default Gui;