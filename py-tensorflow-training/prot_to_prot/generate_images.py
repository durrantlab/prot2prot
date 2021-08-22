from PIL import Image
import numpy
# from pix2pix import use_training

def generate_images(model, test_input, target, use_training, pause=False):
    prediction = model(test_input, training=use_training)
    if pause:
        import pdb; pdb.set_trace()
        
    print("Save images here...")
    # plt.figure(figsize=(15, 15))

    display_list = [test_input[0], target[0], prediction[0]]
    display_list_np = [i.cpu().numpy() for i in display_list]
    title = ["input.png", "target.png", "predicted.png"]
    for i, a in enumerate(display_list_np):
        t = title[i]
        # if t == "target.png":
            # import pdb; pdb.set_trace()
        a = 255 * 0.5 * (a + 1) # 0 to 2
        img_np = a.astype(numpy.uint8)
        img = Image.fromarray(img_np)
        img.save(t)

    # title = ['Input Image', 'Ground Truth', 'Predicted Image']

    # for i in range(3):
    #     plt.subplot(1, 3, i+1)
    #     plt.title(title[i])
    #     # Getting the pixel values in the [0, 1] range to plot.
    #     plt.imshow(display_list[i] * 0.5 + 0.5)
    #     plt.axis('off')
    # plt.show()

    return test_input, prediction

