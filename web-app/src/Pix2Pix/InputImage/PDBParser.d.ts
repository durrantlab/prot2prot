import * as tf from '@tensorflow/tfjs';
export declare let coorsTensor: tf.Tensor<tf.Rank>;
export declare let elements: string[];
export declare let vdw: tf.Tensor<tf.Rank>;
export declare function parsePDB(pdbText: string): void;
