# Training

1. Make sure there's a subdirectory in `./imgs/` with appropriately sized
   images.
   - See `../gen-training-data/` for scripts to generate this image data.
2. Run the docker container.

   ```python
   cd ./docker/
   ./pytorch_docker_container.sh ../
   ```

3. Train the model for the desired image dimension.

   ```bash
   ./train.sh 256
   ```

   The code for training is taken from [junyanz/pytorch-CycleGAN-and-pix2pix:
   Image-to-Image Translation in
   PyTorch](https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix), with only
   minor modifications that export an onnx model when using `test.py`.

4. If you use [kitty terminal](https://sw.kovidgoyal.net/kitty/), visualize the
   latest images (during training) to monitor progress.

   ```bash
   ./latest_imgs.sh 256
   ```

5. Once the model is done training, convert it to a tensorflowjs model:

   ```bash
   ./export.sh 256
   ```
