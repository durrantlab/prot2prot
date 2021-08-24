from ...image_processing import random_jitter, normalize, resize
import glob
import random
import tensorflow as tf
from ...vars import IMG_DIMEN


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