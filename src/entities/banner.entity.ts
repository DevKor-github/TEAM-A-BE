import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('banner')
export class BannerEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { nullable: false })
  imageUrl: string;

  @Column('varchar', { nullable: false })
  title: string;
}
