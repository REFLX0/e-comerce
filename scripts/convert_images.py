import os
from pathlib import Path
from rembg import remove
from PIL import Image

def main():
    directory = Path('frontend/public/img/products')
    
    if not directory.exists():
        print(f"Directory {directory} does not exist.")
        return

    jpg_files = list(directory.glob('*.jpg'))
    print(f"Found {len(jpg_files)} .jpg files to process.")

    for i, file_path in enumerate(jpg_files):
        print(f"Processing {i+1}/{len(jpg_files)}: {file_path.name}")
        output_path = file_path.with_suffix('.png')
        
        try:
            input_image = Image.open(file_path)
            output_image = remove(input_image)
            output_image.save(output_path, "PNG")
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")

    print("Finished converting all images to transparent PNGs.")

if __name__ == '__main__':
    main()
