python train.py \
  --root_dir ./data/train \
  --model_name google/vit-base-patch16-224 \
  --num_classes 2 \
  --batch_size 32 \
  --epochs 10 \
  --lr 1e-4 \
  --save_path ./models/best_model.pth \
  --log_file ./logs/training.log