from .vars import get_img_dimen
import tensorflow as tf
from .down_up_samples import downsample

"""
## Build the discriminator

The discriminator in the pix2pix cGAN is a convolutional PatchGAN classifier—it
tries to classify if each image _patch_ is real or not real, as described in the
[pix2pix paper](https://arxiv.org/abs/1611.07004).

- Each block in the discriminator is: Convolution -> Batch normalization ->
  Leaky ReLU.
- The shape of the output after the last layer is `(batch_size, 30, 30, 1)`.
- Each `30 x 30` image patch of the output classifies a `70 x 70` portion of the
  input image.
- The discriminator receives 2 inputs: 
    - The input image and the target image, which it should classify as real.
    - The input image and the generated image (the output of the generator),
      which it should classify as fake.
    - Use `tf.concat([inp, tar], axis=-1)` to concatenate these 2 inputs
      together.

Let's define the discriminator:
"""


def Discriminator():
    # TODO: I think the layers discriminator don't change as much as the
    # generator.

    initializer = tf.random_normal_initializer(0., 0.02)

    # inp = tf.keras.layers.Input(shape=[256, 256, 3], name='input_image')
    # tar = tf.keras.layers.Input(shape=[256, 256, 3], name='target_image')

    # TODO: Did update this.
    IMG_DIMEN = get_img_dimen()
    inp = tf.keras.layers.Input(shape=[IMG_DIMEN, IMG_DIMEN, 3], name='input_image')
    tar = tf.keras.layers.Input(shape=[IMG_DIMEN, IMG_DIMEN, 3], name='target_image')

    # (batch_size, 256, 256, channels*2)
    x = tf.keras.layers.concatenate([inp, tar])

    down1 = downsample(64, 4, False)(x)  # (batch_size, 128, 128, 64)
    down2 = downsample(128, 4)(down1)  # (batch_size, 64, 64, 128)
    down3 = downsample(256, 4)(down2)  # (batch_size, 32, 32, 256)

    zero_pad1 = tf.keras.layers.ZeroPadding2D()(down3)  # (batch_size, 34, 34, 256)
    conv = tf.keras.layers.Conv2D(512, 4, strides=1,
                                kernel_initializer=initializer,
                                use_bias=False)(zero_pad1)  # (batch_size, 31, 31, 512)

    batchnorm1 = tf.keras.layers.BatchNormalization()(conv)

    leaky_relu = tf.keras.layers.LeakyReLU()(batchnorm1)

    zero_pad2 = tf.keras.layers.ZeroPadding2D()(
        leaky_relu)  # (batch_size, 33, 33, 512)

    last = tf.keras.layers.Conv2D(1, 4, strides=1,
                                kernel_initializer=initializer)(zero_pad2)  # (batch_size, 30, 30, 1)

    return tf.keras.Model(inputs=[inp, tar], outputs=last)

"""### Define the discriminator loss

- The `discriminator_loss` function takes 2 inputs: **real images** and **generated images**.
- `real_loss` is a sigmoid cross-entropy loss of the **real images** and an **array of ones(since these are the real images)**.
- `generated_loss` is a sigmoid cross-entropy loss of the **generated images** and an **array of zeros (since these are the fake images)**.
- The `total_loss` is the sum of `real_loss` and `generated_loss`.
"""


def discriminator_loss(disc_real_output, disc_generated_output, loss_object):
    real_loss = loss_object(tf.ones_like(disc_real_output), disc_real_output)

    generated_loss = loss_object(tf.zeros_like(
        disc_generated_output), disc_generated_output)

    total_disc_loss = real_loss + generated_loss

    return total_disc_loss

