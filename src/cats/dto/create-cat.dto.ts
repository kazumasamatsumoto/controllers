// controllers.mdの「リクエストペイロード」セクションに対応
// バリデーション機能の実装
import { IsString, IsInt, Min } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  breed: string;
}
