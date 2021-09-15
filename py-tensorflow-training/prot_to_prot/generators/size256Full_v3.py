import tensorflow as tf
from ..vars import OUTPUT_CHANNELS
from ..down_up_samples import downsample, upsample, upsample2

PATH = "./size_256_full/"
CHECKPOINT_DIR = "./training_checkpoints_256_full_v3"

IMG_DIMEN = 256

def Generator():
    inputs = tf.keras.layers.Input(shape=[256, 256, 3])

    down_stack = [
        downsample(64, 4, apply_batchnorm=False, layer_name="downsample1"),  # (batch_size, 128, 128, 64)
        downsample(128, 4, layer_name="downsample2"),  # (batch_size, 64, 64, 128)
        downsample(256, 4, layer_name="downsample3"),  # (batch_size, 32, 32, 256)
        downsample(512, 4, layer_name="downsample4"),  # (batch_size, 16, 16, 512)
        downsample(512, 4, layer_name="downsample5"),  # (batch_size, 8, 8, 512)
        downsample(512, 4, layer_name="downsample6"),  # (batch_size, 4, 4, 512)
        downsample(512, 4, layer_name="downsample7"),  # (batch_size, 2, 2, 512)
        
        # TODO: JDD added apply_batchnorm=False to the below because of a
        # tensorflow bug: https://github.com/tensorflow/tensorflow/issues/38698
        # To compensate, would like to use instancenorm per
        # https://stackoverflow.com/questions/61804006/export-pix2pix-generator-to-tflite-model
        # But can't use that, because doesn't easily export to tfjs. So using
        # LayerNormalization, which isn't ideal for CNN but perhaps better than
        # nothing. Seems like LayerNoralization also isn't exactly the same in
        # the browser.
        downsample(512, 4, apply_batchnorm=False, apply_layernorm=True, layer_name="downsample8"),  # (batch_size, 1, 1, 512)
    ]

    # upsmpl = upsample2

    up_stack = [
        upsample(512, 4, apply_dropout=True, layer_name="upsample1"),  # (batch_size, 2, 2, 1024)
        upsample2(512, 4, apply_dropout=True, layer_name="upsample2"),  # (batch_size, 4, 4, 1024)
        upsample(512, 4, apply_dropout=True, layer_name="upsample3"),  # (batch_size, 8, 8, 1024)
        upsample2(512, 4, layer_name="upsample4"),  # (batch_size, 16, 16, 1024)
        upsample(256, 4, layer_name="upsample5"),  # (batch_size, 32, 32, 512)
        upsample2(128, 4, layer_name="upsample6"),  # (batch_size, 64, 64, 256)
        upsample(64, 4, layer_name="upsample7"),  # (batch_size, 128, 128, 128)
    ]

    initializer = tf.random_normal_initializer(0., 0.02)
    last = tf.keras.layers.Conv2DTranspose(OUTPUT_CHANNELS, 4,
                                           strides=2,
                                           padding='same',
                                           kernel_initializer=initializer,
                                           activation='tanh')  # (batch_size, 256, 256, 3)

    # Consider: https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix/issues/190
    # https://distill.pub/2016/deconv-checkerboard/

    x = inputs

    # Downsampling through the model
    skips = []
    for down in down_stack:
        x = down(x)
        skips.append(x)

    skips = reversed(skips[:-1])

    # for up, skip in zip(up_stack, skips):
    #     x = up(x)
    #     print(x.shape, skip.shape)
    # sdfsdff

    # Upsampling and establishing the skip connections
    for up, skip in zip(up_stack, skips):
        x = up(x)
        # print(x.shape, skip.shape)
        x = tf.keras.layers.Concatenate()([x, skip])

    x = last(x)

    return tf.keras.Model(inputs=inputs, outputs=x)

