import tensorflow as tf
import glob
import random
from .vars import get_img_dimen

def resize(input_image, real_image, height, width):
    input_image = tf.image.resize(input_image, [height, width],
                                method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
    real_image = tf.image.resize(real_image, [height, width],
                                method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)

    return input_image, real_image


def random_crop(input_image, real_image):
    stacked_image = tf.stack([input_image, real_image], axis=0)
    IMG_DIMEN = get_img_dimen()
    cropped_image = tf.image.random_crop(
        stacked_image, size=[2, IMG_DIMEN, IMG_DIMEN, 3])

    return cropped_image[0], cropped_image[1]

def normalize(input_image, real_image):
    input_image = (input_image / 127.5) - 1
    real_image = (real_image / 127.5) - 1

    return input_image, real_image


@tf.function()
def random_jitter(input_image, real_image):
    # Resizing to 286x286
    # input_image, real_image = resize(input_image, real_image, 286, 286)
    IMG_DIMEN = get_img_dimen()
    input_image, real_image = resize(
        input_image, real_image, IMG_DIMEN + 30, IMG_DIMEN + 30)  # TODO: UPDATED

    # Random cropping back to 256x256
    input_image, real_image = random_crop(input_image, real_image)

    if tf.random.uniform(()) > 0.5:
        # Random mirroring
        input_image = tf.image.flip_left_right(input_image)
        real_image = tf.image.flip_left_right(real_image)

    return input_image, real_image

