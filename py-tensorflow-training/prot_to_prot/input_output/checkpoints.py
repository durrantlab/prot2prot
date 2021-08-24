import os
import tensorflow as tf

# from pix2pix import use_training


checkpoint_prefix = None
checkpoint = None
CHECKPOINT_DIR = None

def make_checkpoint(checkpoint_dir, generator_optimizer, discriminator_optimizer, generator, discriminator):
    global checkpoint_prefix, checkpoint, CHECKPOINT_DIR
    CHECKPOINT_DIR = checkpoint_dir
    checkpoint_prefix = os.path.join(CHECKPOINT_DIR, "ckpt")
    checkpoint = tf.train.Checkpoint(generator_optimizer=generator_optimizer,
                                    discriminator_optimizer=discriminator_optimizer,
                                    generator=generator,
                                    discriminator=discriminator)

def restore_checkpoint():
    global checkpoint, CHECKPOINT_DIR
    checkpoint.restore(tf.train.latest_checkpoint(CHECKPOINT_DIR))

def save_checkpoint():
    global checkpoint, checkpoint_prefix
    checkpoint.save(file_prefix=checkpoint_prefix)