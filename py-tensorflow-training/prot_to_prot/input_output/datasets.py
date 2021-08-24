import tensorflow as tf
from .images.loading import load_image_train, load_image_test

def load_datasets(path, buffer_size, batch_size):
    train_dataset = tf.data.Dataset.list_files(str(path + 'train/*.png'))
    train_dataset = train_dataset.map(load_image_train,
                                    num_parallel_calls=tf.data.AUTOTUNE)
    train_dataset = train_dataset.shuffle(buffer_size)
    train_dataset = train_dataset.batch(batch_size)

    try:
        test_dataset = tf.data.Dataset.list_files(str(path + 'test/*.png'))
    except tf.errors.InvalidArgumentError:
        test_dataset = tf.data.Dataset.list_files(str(path + 'val/*.png'))
    test_dataset = test_dataset.map(load_image_test)
    test_dataset = test_dataset.batch(batch_size)

    return train_dataset, test_dataset