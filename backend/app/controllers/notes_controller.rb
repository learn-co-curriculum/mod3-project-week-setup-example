class NotesController < ApplicationController
  before_action :set_note, only: [:show,:update,:destory]

  def index
    notes = Note.all
    render json: notes, status: 200
  end

  def create
    note = Note.create(note_params)
    render json: note, status: 201
  end

  def update
    @note.update(note_params)
    render json: @note, status: 200
  end

  def destroy
    @note.destory
    render json: {message:"You successfully delete the note"}, status: 204
  end

  def show
    render json: @note, status: 200
  end

  private
  def note_params
    params.permit(:body)
  end

  def set_note
    @note = Note.find(params[:id])
  end
end
