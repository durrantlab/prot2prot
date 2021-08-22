import tensorflow as tf
import glob
import random
from .vars import IMG_DIMEN

def load_from_img(image_file):
    # Read and decode an image file to a uint8 tensor
    image = tf.io.read_file(image_file)
    image = tf.image.decode_jpeg(image)

    # Split each image tensor into two tensors:
    # - one with a real building facade image
    # - one with an architecture label image
    w = tf.shape(image)[1]
    w = w // 2

    # TODO: JDD changed below (flipped input and real).
    # input_image = image[:, w:, :]
    # real_image = image[:, :w, :]
    real_image = image[:, w:, :]
    input_image = image[:, :w, :]

    # Convert both images to float32 tensors
    input_image = tf.cast(input_image, tf.float32)
    real_image = tf.cast(real_image, tf.float32)

    return input_image, real_image

def resize(input_image, real_image, height, width):
    input_image = tf.image.resize(input_image, [height, width],
                                method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
    real_image = tf.image.resize(real_image, [height, width],
                                method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)

    return input_image, real_image


def random_crop(input_image, real_image):
    stacked_image = tf.stack([input_image, real_image], axis=0)
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
    input_image, real_image = resize(
        input_image, real_image, IMG_DIMEN + 30, IMG_DIMEN + 30)  # TODO: UPDATED

    # Random cropping back to 256x256
    input_image, real_image = random_crop(input_image, real_image)

    if tf.random.uniform(()) > 0.5:
        # Random mirroring
        input_image = tf.image.flip_left_right(input_image)
        real_image = tf.image.flip_left_right(real_image)

    return input_image, real_image

def load_image_train(image_file, rand_jitt=True):
    input_image, real_image = load_from_img(image_file)
    if rand_jitt:  # TODO: JDD add to test.
        input_image, real_image = random_jitter(input_image, real_image)
    input_image, real_image = normalize(input_image, real_image)

    return input_image, real_image


def load_image_test(image_file):
    input_image, real_image = load_from_img(image_file)
    input_image, real_image = resize(input_image, real_image,
                                    IMG_DIMEN, IMG_DIMEN)
    input_image, real_image = normalize(input_image, real_image)

    return input_image, real_image

def get_random_img(path):
    fls = glob.glob(str(path + 'train/*.png'))
    return random.choice(fls)

