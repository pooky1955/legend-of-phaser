import cv2
import os


def split_images(input_dir, enemy, output_dir):

    images = os.listdir(os.path.join(input_dir, enemy))
    output_enemy = os.path.join(output_dir, enemy)
    if not os.path.exists(output_enemy):
        os.makedirs(output_enemy)

    for img_name in images:
        img_path = os.path.join(input_dir, enemy, img_name)
        image = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
        new_img_name = ''.join(img_name.split("(")[0].split(" "))
        try:
            # is a stripe
            width_s, height_s = img_name.split("(")[1].split(")")[0].split(
                "x")  # spltis something like image (32x25).png
            width, height = int(width_s), int(height_s)
            # print(f"width={width},height={height} for {image}")
            # print(img_path)
            try:
                assert height == image.shape[
                    0], f"height does not match (given height={height} vs image height={image.shape[0]}"
                assert image.shape[
                    1] % width == 0, f"width is not divisible by sprite size (given width={width} vs image width={image.shape[1]})"

                count = image.shape[1] / width
                for i in range(int(count)):
                    start_ind = int(i * width)
                    end_ind = int(start_ind + width)
                    output_img_dir = os.path.join(output_dir, enemy, new_img_name)
                    if not os.path.exists(output_img_dir): os.makedirs(output_img_dir)
                    output_path = os.path.join(output_img_dir,f'{i:03d}.png')
                    image_sliced = image[:, start_ind:end_ind]
                    cv2.imwrite(output_path, image_sliced)
            except Exception as e:
                print(e)
                print(f"skipping {img_path}")
                continue
            # print(f"image shape={image.shape}")
        except IndexError:
            # not a stripe
            output_path = os.path.join(
                output_dir, enemy, new_img_name)
            cv2.imwrite(output_path, image)
            print(f"{img_path} not a stripe")


output_dir = input("Enter output dir: ")
input_dir = input("Enter input dir: ")
all_enemies = [file for file in os.listdir() if os.path.isdir(file)]
for enemy in all_enemies:
    real_dir = os.path.join(input_dir, enemy)
    split_images(input_dir, enemy, output_dir)
