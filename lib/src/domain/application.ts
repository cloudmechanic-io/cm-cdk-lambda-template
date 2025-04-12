import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("application")
export class Application {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  apiKey: string;
}
