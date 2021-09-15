import tensorflow as tf
from ..vars import OUTPUT_CHANNELS
from ..down_up_samples import downsample, upsample

PATH = "./imgs/"
CHECKPOINT_DIR = "./training_checkpoints"

IMG_DIMEN = 1024  # TODO: UPDATED

def Generator():
    # TODO: UPDATED
    # inputs = tf.keras.layers.Input(shape=[256, 256, 3])
    inputs = tf.keras.layers.Input(shape=[1024, 1024, 3])

    ngf = 64  # number of filters in first layer of generator

    down_stack = [
        # downsample(64, 4, apply_batchnorm=False),  # (batch_size, 128, 128, 64)
        # downsample(128, 4),  # (batch_size, 64, 64, 128)
        # downsample(256, 4),  # (batch_size, 32, 32, 256)
        # downsample(512, 4),  # (batch_size, 16, 16, 512)
        # downsample(512, 4),  # (batch_size, 8, 8, 512)
        # downsample(512, 4),  # (batch_size, 4, 4, 512)
        # downsample(512, 4),  # (batch_size, 2, 2, 512)
        # downsample(512, 4),  # (batch_size, 1, 1, 512)

        # downsample(ngf * 1, 4, apply_batchnorm=False),  # (batch_size, 128, 128, 64)  # Input layer?
        # downsample(ngf * 2, 4),  # (batch_size, 64, 64, 128)
        # downsample(ngf * 4, 4),  # (batch_size, 32, 32, 256)
        # downsample(ngf * 8, 4),  # (batch_size, 16, 16, 512)
        # downsample(ngf * 8, 4),  # (batch_size, 8, 8, 512)
        # downsample(ngf * 8, 4),  # (batch_size, 4, 4, 512)
        # downsample(ngf * 8, 4),  # (batch_size, 2, 2, 512)
        # downsample(ngf * 8, 4),  # (batch_size, 1, 1, 512)

        # TODO: UPDATED
        downsample(ngf * 1, 4, apply_batchnorm=False),  # Input layer?
        downsample(ngf * 2, 4),  # (batch_size, 256, 256, 128]
        downsample(ngf * 4, 4),  # (batch_size, 128, 128, 256]
        downsample(ngf * 8, 4),  # (batch_size, 64, 64, 512]
        downsample(ngf * 8, 4),  # (batch_size, 32, 32, 512]
        downsample(ngf * 16, 4),  # (batch_size, 16, 16, 1024]
        downsample(ngf * 16, 4),  # (batch_size, 8, 8, 1024]
        downsample(ngf * 16, 4),  # (batch_size, 4, 4, 1024]
        downsample(ngf * 16, 4),  # (batch_size, 2, 2, 1024]
        downsample(ngf * 32, 4),  # (batch_size, 1, 1, 2048]
    ]

    up_stack = [
        # upsample(512, 4, apply_dropout=True),  # (batch_size, 2, 2, 1024)
        # upsample(512, 4, apply_dropout=True),  # (batch_size, 4, 4, 1024)
        # upsample(512, 4, apply_dropout=True),  # (batch_size, 8, 8, 1024)
        # upsample(512, 4),  # (batch_size, 16, 16, 1024)
        # upsample(256, 4),  # (batch_size, 32, 32, 512)
        # upsample(128, 4),  # (batch_size, 64, 64, 256)
        # upsample(64, 4),  # (batch_size, 128, 128, 128)

        # TODO: UPDATED
        upsample(ngf * 16, 4, apply_dropout=True),
        upsample(ngf * 16, 4, apply_dropout=True),
        upsample(ngf * 16, 4, apply_dropout=True),
        upsample(ngf * 16, 4, apply_dropout=True),
        upsample(ngf * 8, 4, apply_dropout=True),
        upsample(ngf * 8, 4, apply_dropout=True),
        upsample(ngf * 4, 4),
        upsample(ngf * 2, 4),
        upsample(ngf * 1, 4)
    ]

    initializer = tf.random_normal_initializer(0., 0.02)
    last = tf.keras.layers.Conv2DTranspose(OUTPUT_CHANNELS, 4,
                                           strides=2,
                                           padding='same',
                                           kernel_initializer=initializer,
                                           activation='tanh')  # (batch_size, 256, 256, 3)

    x = inputs

    # Downsampling through the model
    skips = []
    for down in down_stack:
        x = down(x)
        skips.append(x)

    skips = reversed(skips[:-1])

    # Upsampling and establishing the skip connections
    for up, skip in zip(up_stack, skips):
        x = up(x)
        x = tf.keras.layers.Concatenate()([x, skip])

    x = last(x)

    return tf.keras.Model(inputs=inputs, outputs=x)

