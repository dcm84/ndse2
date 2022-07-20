import "reflect-metadata";
import { Container } from "inversify";
import {IBooksRepository} from "../interfaces/IBooksRepository"
import {BooksRepository} from "./BooksRepository"

const container = new Container();

//container.bind(BooksRepository).toSelf();
container.bind(IBooksRepository).to(BooksRepository);

exports.container = container;