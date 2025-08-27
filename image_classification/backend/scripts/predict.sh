python -m src.predict \
  --model_name google/vit-base-patch16-224 \
  --checkpoint_path ./models/best_model.pth \
  --num_classes 2 \
  --images ./data/test/1.jpg ./data/test/2.jpg \
  --output_path ./results/predictions.csv