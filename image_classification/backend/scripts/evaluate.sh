python -m src.evaluate \
  --root_dir ./data/train \
  --checkpoint_path ./models/best_model.pth \
  --model_name google/vit-base-patch16-224 \
  --num_classes 2 \
  --batch_size 32 \
  --device cpu