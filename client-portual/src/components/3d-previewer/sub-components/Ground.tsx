import { Grid } from "@react-three/drei";

const GRID_SIZE = 10.5;
const GRID_POSITION_Y = -0.01;
const DEFAULT_POSITION = 0;

const gridConfig = {
  cellColor: "#fcba03",
  cellSize: 0.5,
  cellThickness: 0.5,
  fadeDistance: 30,
  fadeStrength: 1,
  followCamera: false,
  infiniteGrid: true,
  sectionColor: "grey",
  sectionSize: 3,
  sectionThickness: 1
};

/**
 * A component that renders a grid of lines to serve as a visual ground.
 * @param {boolean} visible Whether the grid should be visible or not.
 */
export default function Ground(visible: boolean) {
  return (
    <Grid
      args={[GRID_SIZE, GRID_SIZE]}
      position={[DEFAULT_POSITION, GRID_POSITION_Y, DEFAULT_POSITION]}
      visible={visible}
      {...gridConfig}
    />
  );
}
