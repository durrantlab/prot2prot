import numpy
from .checkpoints import restore_checkpoint
import time
import pdb
import sys

def export_model(test_and_save, generator):
    try:
        # TODO: JDD addition: restore checkpoint here
        restore_checkpoint()
        print("Loaded checkpoint...")

        if test_and_save:
            # This works, but output image is not valid (both JavaScript and Python gave
            # similar results, so it's real)
            # def model_refresh_without_nan(model):
            #     # See https://github.com/tensorflow/tensorflow/issues/38698 to overcome
            #     # bug
            #     valid_weights = []
            #     for i, l in enumerate(model.get_weights()):
            #         if numpy.isnan(l).any():
            #             new_weights = numpy.nan_to_num(l)
            #             # new_weights[:] = 1
            #             valid_weights.append(new_weights)
            #             print("!!!!!", l, i)
            #         else:
            #             valid_weights.append(l)
            #     model.set_weights(valid_weights)
            # model_refresh_without_nan(generator)

            def check_nan_in_model(model):
                # See https://github.com/tensorflow/tensorflow/issues/38698
                for il, layer in enumerate(model.layers):
                    for iw, l in enumerate(layer.weights):
                        if numpy.isnan(l).any():
                            print("\nlayer #" + str(il) + " (" + layer.name + "), weight " + str(iw) + ", has NaN!\n")
                            return

                print("\nGood! NaN not found in any layer weights!\n")
            check_nan_in_model(generator)

            # tf.saved_model.save(generator, "./pb_tests_test/")
            # generator.save("test-model.h5", save_format='h5')
            generator.save("test-model")
            print("Saved pb model...")

            # Below for testing
            # _input_image, _real_image = load_image_train(str(PATH + 'train/0471202805568984.new.png.2-2.png'), False)
            # gen_output = generator(_input_image[tf.newaxis, ...], training=False)

            # test_input, prediction = generate_images(
            #     generator, 
            #     tf.reshape(_input_image, [1, IMG_DIMEN, IMG_DIMEN, 3]), 
            #     tf.reshape(_real_image, [1, IMG_DIMEN, IMG_DIMEN, 3]), 
            #     use_training
            #     False
            # )

            print("")
            print("Testing...")
            print("")

            # print("tensor.arraySync()[0][64][151]")
            # print(test_input[0][64][151].numpy())
            # print("")
            # print("result.arraySync()[0][64][151]")
            # print(prediction[0][64][151].numpy())
            # print("")
            print("getWeights()")
            print("\n".join([str(i+1) + ":  " + str(numpy.min(w)) + " " + str(numpy.max(w)) for i, w in enumerate(generator.get_weights())]))

            pdb.set_trace()
            sys.exit(0)
    except:
        print("NO CHECKPOINT TO RESTORE, OR SOME OTHER ERROR!")
        time.sleep(5)