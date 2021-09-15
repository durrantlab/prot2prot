import tensorflow as tf

LAMBDA = 100

"""### Define the generator loss

GANs learn a loss that adapts to the data, while cGANs learn a structured loss
that penalizes a possible structure that differs from the network output and the
target image, as described in the [pix2pix
paper](https://arxiv.org/abs/1611.07004).

- The generator loss is a sigmoid cross-entropy loss of the generated images and
    an **array of ones**.
- The pix2pix paper also mentions the L1 loss, which is a MAE (mean absolute
    error) between the generated image and the target image.
- This allows the generated image to become structurally similar to the target
    image.
- The formula to calculate the total generator loss is `gan_loss + LAMBDA *
    l1_loss`, where `LAMBDA = 100`. This value was decided by the authors of the
    paper.
"""

def generator_loss(disc_generated_output, gen_output, target, loss_object):
    gan_loss = loss_object(tf.ones_like(
        disc_generated_output), disc_generated_output)

    # Mean absolute error
    l1_loss = tf.reduce_mean(tf.abs(target - gen_output))

    total_gen_loss = gan_loss + (LAMBDA * l1_loss)

    return total_gen_loss, gan_loss, l1_loss
