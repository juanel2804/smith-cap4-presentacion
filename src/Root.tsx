import React from 'react';
import {Composition} from 'remotion';
import {Video, TOTAL_FRAMES} from './Video';

export const Root: React.FC = () => (
  <Composition
    id="Smith"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1280}
    height={720}
  />
);
