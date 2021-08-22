import tensorflow as tf
# import tensorflow_addons as tfa


"""Define the upsampler (decoder):"""


def upsample(filters, size, apply_dropout=False, layer_name=None):
    initializer = tf.random_normal_initializer(0., 0.02)

    result = tf.keras.Sequential(name=layer_name)
    result.add(
        tf.keras.layers.Conv2DTranspose(filters, size, strides=2,
                                        padding='same',
                                        kernel_initializer=initializer,
                                        use_bias=False))

    result.add(tf.keras.layers.BatchNormalization())

    if apply_dropout:
        result.add(tf.keras.layers.Dropout(0.5))

    result.add(tf.keras.layers.ReLU())

    return result


def downsample(filters, size, apply_batchnorm=True, apply_layernorm=False, layer_name=None):
    initializer = tf.random_normal_initializer(0., 0.02)

    result = tf.keras.Sequential(name=layer_name)
    result.add(
        tf.keras.layers.Conv2D(filters, size, strides=2, padding='same',
                               kernel_initializer=initializer, use_bias=False))

    if apply_batchnorm:
        result.add(tf.keras.layers.BatchNormalization())
    
    # if apply_layernorm:
        # TODO: JDD added this to avoid a tf bug error. See
        # https://stackoverflow.com/questions/61804006/export-pix2pix-generator-to-tflite-model
        # But can't use InstanceNormalization, because doesn't easily export to
        # tfjs. So using LayerNormalization, which isn't ideal for CNN, but
        # better than nothing.
        # result.add(tf.keras.layers.LayerNormalization())
        # result.add(tfa.layers.InstanceNormalization())

    result.add(tf.keras.layers.LeakyReLU())

    return result
